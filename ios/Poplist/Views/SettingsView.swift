import SwiftUI

struct SettingsView: View {
    @EnvironmentObject private var authVM: AuthViewModel
    @EnvironmentObject private var proStore: ProStore
    @Environment(\.dismiss) private var dismiss

    @State private var showDeleteConfirm = false
    @State private var showProGate = false

    var body: some View {
        NavigationStack {
            List {

                // ── Account ──────────────────────────────────────────
                Section(String(localized: "section_account")) {
                    if let user = authVM.user {
                        HStack(spacing: 14) {
                            Image(systemName: "person.circle.fill")
                                .font(.system(size: 36))
                                .foregroundStyle(.blue)

                            VStack(alignment: .leading, spacing: 2) {
                                if let name = user.displayName, !name.isEmpty {
                                    Text(name).font(.headline)
                                }
                                Text(user.email ?? String(localized: "no_email"))
                                    .font(.subheadline)
                                    .foregroundStyle(.secondary)
                            }
                        }
                        .padding(.vertical, 4)
                    }

                    Button(String(localized: "sign_out"), role: .destructive) {
                        authVM.signOut()
                        dismiss()
                    }
                }

                // ── Pro ──────────────────────────────────────────────
                Section(String(localized: "section_pro")) {
                    if proStore.isPro {
                        HStack {
                            Label(String(localized: "pro_active"), systemImage: "star.fill")
                                .foregroundStyle(.yellow)
                            Spacer()
                            Text(String(localized: "pro_active_badge"))
                                .font(.caption.weight(.bold))
                                .padding(.horizontal, 8)
                                .padding(.vertical, 3)
                                .background(Color.yellow.opacity(0.15))
                                .foregroundStyle(.orange)
                                .cornerRadius(8)
                        }
                    } else {
                        Button {
                            showProGate = true
                        } label: {
                            HStack {
                                Label(String(localized: "upgrade_to_pro"), systemImage: "star.circle.fill")
                                    .foregroundStyle(.blue)
                                Spacer()
                                Image(systemName: "chevron.right")
                                    .font(.caption.weight(.semibold))
                                    .foregroundStyle(.tertiary)
                            }
                        }

                        Button(String(localized: "restore_purchases")) {
                            Task { await proStore.restore() }
                        }
                        .foregroundStyle(.secondary)
                    }
                }

                // ── Legal ─────────────────────────────────────────────
                Section(String(localized: "section_legal")) {
                    Link(destination: URL(string: "https://allerise.com/privacy")!) {
                        Label(String(localized: "privacy_policy"), systemImage: "lock.shield")
                    }
                    Link(destination: URL(string: "https://allerise.com/terms")!) {
                        Label(String(localized: "terms_of_service"), systemImage: "doc.text")
                    }
                    Link(destination: URL(string: "https://allerise.com/eula")!) {
                        Label(String(localized: "eula"), systemImage: "doc.badge.gearshape")
                    }
                    Link(destination: URL(string: "https://allerise.com/data-deletion")!) {
                        Label(String(localized: "data_deletion"), systemImage: "trash")
                    }
                }

                // ── Danger zone ───────────────────────────────────────
                Section {
                    Button(String(localized: "delete_account"), role: .destructive) {
                        showDeleteConfirm = true
                    }
                } footer: {
                    Text(String(localized: "delete_account_footer"))
                }

                // ── About ─────────────────────────────────────────────
                Section {
                    HStack {
                        Text(String(localized: "version"))
                        Spacer()
                        Text(appVersion)
                            .foregroundStyle(.secondary)
                    }
                    Text(String(localized: "copyright"))
                        .foregroundStyle(.secondary)
                        .font(.footnote)
                }

            }
            .navigationTitle(String(localized: "settings_title"))
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .confirmationAction) {
                    Button(String(localized: "done")) { dismiss() }
                }
            }
        }
        // Pro paywall sheet
        .sheet(isPresented: $showProGate) {
            ProGateView()
                .environmentObject(proStore)
        }
        // Delete account confirmation
        .alert(String(localized: "delete_account_title"), isPresented: $showDeleteConfirm) {
            Button(String(localized: "delete_confirm"), role: .destructive) {
                Task {
                    await authVM.deleteAccount()
                    if authVM.errorMessage == nil { dismiss() }
                }
            }
            Button(String(localized: "cancel"), role: .cancel) {}
        } message: {
            Text(String(localized: "delete_account_message"))
        }
        .alert(String(localized: "error"), isPresented: .init(
            get: { authVM.errorMessage != nil },
            set: { if !$0 { authVM.errorMessage = nil } }
        )) {
            Button(String(localized: "ok"), role: .cancel) { authVM.errorMessage = nil }
        } message: {
            Text(authVM.errorMessage ?? "")
        }
    }

    private var appVersion: String {
        let version = Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String ?? "1.0"
        let build   = Bundle.main.infoDictionary?["CFBundleVersion"] as? String ?? "1"
        return "\(version) (\(build))"
    }
}
