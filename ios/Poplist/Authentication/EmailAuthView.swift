import SwiftUI
import UIKit

struct EmailAuthView: View {
    @EnvironmentObject private var authVM: AuthViewModel
    @Environment(\.dismiss) private var dismiss

    @State private var email = ""
    @State private var password = ""
    @State private var isSignUp = false
    @State private var isLoading = false
    @State private var showForgotPassword = false
    @State private var forgotEmail = ""
    @State private var resetSent = false

    private var isFormValid: Bool {
        !email.trimmingCharacters(in: .whitespaces).isEmpty && password.count >= 1
    }

    var body: some View {
        NavigationStack {
            VStack(spacing: 20) {
                Picker("Mode", selection: $isSignUp) {
                    Text("Sign In").tag(false)
                    Text("Create Account").tag(true)
                }
                .pickerStyle(.segmented)
                .padding(.horizontal)
                .padding(.top, 8)

                VStack(spacing: 12) {
                    NoAssistantTextField(placeholder: "Email", text: $email,
                                        keyboardType: .emailAddress,
                                        autocapitalizationType: .none)
                        .frame(height: 22)
                        .padding()
                        .background(Color(.secondarySystemBackground))
                        .cornerRadius(12)

                    NoAssistantTextField(placeholder: "Password", text: $password,
                                        isSecure: true)
                        .frame(height: 22)
                        .padding()
                        .background(Color(.secondarySystemBackground))
                        .cornerRadius(12)
                }
                .padding(.horizontal)

                if let error = authVM.errorMessage {
                    Text(error)
                        .font(.caption)
                        .foregroundStyle(.red)
                        .multilineTextAlignment(.center)
                        .padding(.horizontal)
                }

                Button {
                    Task {
                        isLoading = true
                        if isSignUp {
                            await authVM.createAccount(email: email, password: password)
                        } else {
                            await authVM.signInWithEmail(email: email, password: password)
                        }
                        isLoading = false
                    }
                } label: {
                    if isLoading {
                        ProgressView()
                            .frame(maxWidth: .infinity, minHeight: 54)
                    } else {
                        Text(isSignUp ? "Create Account" : "Sign In")
                            .font(.system(size: 17, weight: .semibold))
                            .frame(maxWidth: .infinity, minHeight: 54)
                    }
                }
                .background(isFormValid ? Color.blue : Color.blue.opacity(0.4))
                .foregroundStyle(.white)
                .cornerRadius(14)
                .padding(.horizontal)
                .disabled(!isFormValid || isLoading)

                if !isSignUp {
                    Button("Forgot Password?") {
                        forgotEmail = email
                        showForgotPassword = true
                    }
                    .font(.subheadline)
                    .foregroundStyle(.blue)
                }

                Spacer()
            }
            .navigationTitle(isSignUp ? "Create Account" : "Sign In")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                }
            }
            .alert("Reset Password", isPresented: $showForgotPassword) {
                TextField("Email", text: $forgotEmail)
                    .keyboardType(.emailAddress)
                    .textInputAutocapitalization(.never)
                Button("Send Reset Email") {
                    Task {
                        await authVM.resetPassword(email: forgotEmail)
                        resetSent = true
                    }
                }
                Button("Cancel", role: .cancel) {}
            } message: {
                Text("Enter your email to receive a password reset link.")
            }
            .alert("Email Sent", isPresented: $resetSent) {
                Button("OK", role: .cancel) {}
            } message: {
                Text("Check your inbox for a password reset link.")
            }
        }
    }
}

// UITextField wrapper that hides the iOS autofill/password toolbar above the keyboard
private struct NoAssistantTextField: UIViewRepresentable {
    let placeholder: String
    @Binding var text: String
    var isSecure: Bool = false
    var keyboardType: UIKeyboardType = .default
    var autocapitalizationType: UITextAutocapitalizationType = .sentences

    func makeUIView(context: Context) -> UITextField {
        let field = UITextField()
        field.placeholder = placeholder
        field.isSecureTextEntry = isSecure
        field.keyboardType = keyboardType
        field.autocapitalizationType = autocapitalizationType
        field.autocorrectionType = .no
        field.inputAssistantItem.leadingBarButtonGroups = []
        field.inputAssistantItem.trailingBarButtonGroups = []
        field.delegate = context.coordinator
        field.setContentHuggingPriority(.defaultLow, for: .horizontal)
        return field
    }

    func updateUIView(_ uiView: UITextField, context: Context) {
        if uiView.text != text { uiView.text = text }
    }

    func makeCoordinator() -> Coordinator { Coordinator(text: $text) }

    final class Coordinator: NSObject, UITextFieldDelegate {
        @Binding var text: String
        init(text: Binding<String>) { _text = text }

        func textField(_ textField: UITextField,
                       shouldChangeCharactersIn range: NSRange,
                       replacementString string: String) -> Bool {
            if let current = textField.text, let swiftRange = Range(range, in: current) {
                text = current.replacingCharacters(in: swiftRange, with: string)
            }
            return true
        }
    }
}
