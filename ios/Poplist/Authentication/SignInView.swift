import SwiftUI
import AuthenticationServices

struct SignInView: View {
    @EnvironmentObject private var authVM: AuthViewModel
    @State private var showEmailAuth = false

    var body: some View {
        ZStack {
            LinearGradient(
                colors: [Color.blue.opacity(0.08), Color.purple.opacity(0.08)],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            .ignoresSafeArea()

            VStack(spacing: 0) {
                Spacer()

                // Logo
                VStack(spacing: 14) {
                    Image(systemName: "mic.circle.fill")
                        .font(.system(size: 80))
                        .foregroundStyle(.blue)

                    Text("Poplist")
                        .font(.system(size: 36, weight: .bold))

                    Text("Voice-first task list")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                }

                Spacer()

                VStack(spacing: 12) {
                    // Sign in with Apple — must be listed first per Apple HIG
                    SignInWithAppleButton(.signIn) { request in
                        let appleRequest = authVM.startSignInWithApple()
                        request.requestedScopes = appleRequest.requestedScopes ?? []
                        request.nonce = appleRequest.nonce
                    } onCompletion: { result in
                        Task { await authVM.handleAppleSignIn(result: result) }
                    }
                    .signInWithAppleButtonStyle(.black)
                    .frame(height: 54)
                    .cornerRadius(14)

                    // Sign in with Google
                    Button {
                        Task { await authVM.signInWithGoogle() }
                    } label: {
                        HStack(spacing: 10) {
                            Image(systemName: "globe")
                                .font(.system(size: 18, weight: .medium))
                            Text("Sign in with Google")
                                .font(.system(size: 17, weight: .medium))
                        }
                        .frame(maxWidth: .infinity)
                        .frame(height: 54)
                        .background(Color(.systemBackground))
                        .overlay(
                            RoundedRectangle(cornerRadius: 14)
                                .strokeBorder(Color(.separator), lineWidth: 1)
                        )
                        .cornerRadius(14)
                    }
                    .foregroundStyle(.primary)

                    // Email
                    Button {
                        showEmailAuth = true
                    } label: {
                        Text("Continue with Email")
                            .font(.system(size: 17, weight: .medium))
                            .frame(maxWidth: .infinity)
                            .frame(height: 54)
                            .background(Color(.secondarySystemBackground))
                            .cornerRadius(14)
                    }
                    .foregroundStyle(.primary)
                }
                .padding(.horizontal, 24)

                if let error = authVM.errorMessage {
                    Text(error)
                        .font(.caption)
                        .foregroundStyle(.red)
                        .multilineTextAlignment(.center)
                        .padding(.horizontal, 24)
                        .padding(.top, 12)
                }

                Text("By continuing, you agree to our Privacy Policy and Terms of Service.")
                    .font(.caption2)
                    .foregroundStyle(.tertiary)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, 32)
                    .padding(.top, 20)
                    .padding(.bottom, 32)
            }
        }
        .sheet(isPresented: $showEmailAuth) {
            EmailAuthView()
                .environmentObject(authVM)
        }
    }
}
