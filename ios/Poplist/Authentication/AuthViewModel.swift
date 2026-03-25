import Foundation
import Combine
import FirebaseAuth
import FirebaseFirestore
import GoogleSignIn
import AuthenticationServices
import CryptoKit
import UIKit

@MainActor
final class AuthViewModel: NSObject, ObservableObject {
    @Published var user: FirebaseAuth.User?
    @Published var isLoading = true
    @Published var errorMessage: String?

    private var currentNonce: String?
    private var authStateListener: AuthStateDidChangeListenerHandle?

    override init() {
        super.init()
        authStateListener = Auth.auth().addStateDidChangeListener { [weak self] _, user in
            Task { @MainActor in
                self?.user = user
                self?.isLoading = false
            }
        }
    }

    deinit {
        if let listener = authStateListener {
            Auth.auth().removeStateDidChangeListener(listener)
        }
    }

    // MARK: - Sign in with Apple

    func startSignInWithApple() -> ASAuthorizationAppleIDRequest {
        let nonce = randomNonceString()
        currentNonce = nonce
        let provider = ASAuthorizationAppleIDProvider()
        let request = provider.createRequest()
        request.requestedScopes = [.fullName, .email]
        request.nonce = sha256(nonce)
        return request
    }

    func handleAppleSignIn(result: Result<ASAuthorization, Error>) async {
        switch result {
        case .success(let auth):
            guard
                let credential = auth.credential as? ASAuthorizationAppleIDCredential,
                let nonce = currentNonce,
                let tokenData = credential.identityToken,
                let idTokenString = String(data: tokenData, encoding: .utf8)
            else {
                errorMessage = String(localized: "apple_signin_error")
                return
            }
            let firebaseCredential = OAuthProvider.appleCredential(
                withIDToken: idTokenString,
                rawNonce: nonce,
                fullName: credential.fullName
            )
            await signIn(with: firebaseCredential)

        case .failure(let error):
            if (error as NSError).code != ASAuthorizationError.canceled.rawValue {
                errorMessage = error.localizedDescription
            }
        }
    }

    // MARK: - Sign in with Google

    func signInWithGoogle() async {
        guard
            let windowScene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
            let rootVC = windowScene.windows.first?.rootViewController
        else {
            errorMessage = String(localized: "google_signin_error")
            return
        }
        do {
            let result = try await GIDSignIn.sharedInstance.signIn(withPresenting: rootVC)
            guard let idToken = result.user.idToken?.tokenString else {
                errorMessage = String(localized: "google_signin_error")
                return
            }
            let credential = GoogleAuthProvider.credential(
                withIDToken: idToken,
                accessToken: result.user.accessToken.tokenString
            )
            await signIn(with: credential)
        } catch {
            if (error as NSError).code != GIDSignInError.canceled.rawValue {
                errorMessage = error.localizedDescription
            }
        }
    }

    // MARK: - Email / Password

    func signInWithEmail(email: String, password: String) async {
        errorMessage = nil
        do {
            try await Auth.auth().signIn(withEmail: email, password: password)
        } catch {
            errorMessage = friendlyAuthError(error)
        }
    }

    func createAccount(email: String, password: String) async {
        errorMessage = nil
        do {
            try await Auth.auth().createUser(withEmail: email, password: password)
        } catch {
            errorMessage = friendlyAuthError(error)
        }
    }

    func resetPassword(email: String) async {
        errorMessage = nil
        do {
            try await Auth.auth().sendPasswordReset(withEmail: email)
        } catch {
            errorMessage = friendlyAuthError(error)
        }
    }

    // MARK: - Sign Out

    func signOut() {
        try? Auth.auth().signOut()
        GIDSignIn.sharedInstance.signOut()
    }

    // MARK: - Delete Account  (Apple mandatory requirement since Jun 30 2022)
    // Erases all Firestore data for this user, then deletes the Firebase Auth account.
    // If recent login is required, errorMessage is set so the caller can re-authenticate.

    func deleteAccount() async {
        errorMessage = nil
        guard let user = Auth.auth().currentUser else { return }
        let uid = user.uid
        let db  = Firestore.firestore()

        do {
            // Delete all task documents owned by this user
            let snapshot = try await db.collection("tasks")
                .whereField("userId", isEqualTo: uid)
                .getDocuments()

            let batch = db.batch()
            snapshot.documents.forEach { batch.deleteDocument($0.reference) }
            try await batch.commit()

            // Delete Firebase Auth account
            try await user.delete()

        } catch let error as NSError
            where AuthErrorCode(rawValue: error.code) == .requiresRecentLogin {
            // Apple Sign-In or Google require re-authentication before deletion.
            // Surface this so the UI can prompt a fresh sign-in then retry.
            errorMessage = String(localized: "delete_reauth_required")
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    // MARK: - Private helpers

    private func signIn(with credential: AuthCredential) async {
        do {
            try await Auth.auth().signIn(with: credential)
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    private func friendlyAuthError(_ error: Error) -> String {
        let nsError = error as NSError
        guard let code = AuthErrorCode(rawValue: nsError.code) else {
            return error.localizedDescription
        }
        switch code {
        case .wrongPassword, .invalidCredential:
            return String(localized: "auth_wrong_password")
        case .userNotFound:
            return String(localized: "auth_user_not_found")
        case .emailAlreadyInUse:
            return String(localized: "auth_email_in_use")
        case .weakPassword:
            return String(localized: "auth_weak_password")
        case .invalidEmail:
            return String(localized: "auth_invalid_email")
        default:
            return error.localizedDescription
        }
    }

    private func randomNonceString(length: Int = 32) -> String {
        var randomBytes = [UInt8](repeating: 0, count: length)
        _ = SecRandomCopyBytes(kSecRandomDefault, randomBytes.count, &randomBytes)
        let charset: [Character] = Array("0123456789ABCDEFGHIJKLMNOPQRSTUVXYZabcdefghijklmnopqrstuvwxyz-._")
        return String(randomBytes.map { charset[Int($0) % charset.count] })
    }

    private func sha256(_ input: String) -> String {
        let data = Data(input.utf8)
        let hash = SHA256.hash(data: data)
        return hash.compactMap { String(format: "%02x", $0) }.joined()
    }
}
