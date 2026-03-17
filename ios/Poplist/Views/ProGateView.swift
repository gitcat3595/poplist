import SwiftUI
import StoreKit

struct ProGateView: View {
    @EnvironmentObject private var proStore: ProStore
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        ScrollView {
            VStack(spacing: 0) {
                // Drag handle
                RoundedRectangle(cornerRadius: 3)
                    .fill(Color(.systemFill))
                    .frame(width: 36, height: 5)
                    .padding(.top, 12)
                    .padding(.bottom, 28)

                // Header
                VStack(spacing: 12) {
                    ZStack {
                        Circle()
                            .fill(Color.yellow.opacity(0.15))
                            .frame(width: 100, height: 100)
                        Image(systemName: "star.circle.fill")
                            .font(.system(size: 60))
                            .foregroundStyle(.yellow)
                    }

                    Text("Poplist Pro")
                        .font(.system(size: 28, weight: .bold))

                    Text(String(localized: "pro_subtitle"))
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                        .multilineTextAlignment(.center)
                }
                .padding(.bottom, 32)

                // Feature list
                VStack(alignment: .leading, spacing: 16) {
                    ProFeatureRow(icon: "paintpalette.fill",                  color: .purple, key: "pro_feature_colours")
                    ProFeatureRow(icon: "folder.badge.plus",                  color: .blue,   key: "pro_feature_categories")
                    ProFeatureRow(icon: "waveform.badge.mic",                 color: .red,    key: "pro_feature_voice")
                    ProFeatureRow(icon: "icloud.fill",                        color: .cyan,   key: "pro_feature_sync")
                    ProFeatureRow(icon: "arrow.up.arrow.down.circle.fill",    color: .green,  key: "pro_feature_sort")
                }
                .padding(.horizontal, 32)
                .padding(.bottom, 36)

                // Purchase options
                if proStore.isLoading {
                    ProgressView()
                        .padding(.vertical, 24)
                } else {
                    VStack(spacing: 12) {
                        ForEach(proStore.products) { product in
                            PurchaseButton(product: product) {
                                Task { await proStore.purchase(product) }
                            }
                        }

                        if proStore.products.isEmpty {
                            Text(String(localized: "iap_unavailable"))
                                .font(.subheadline)
                                .foregroundStyle(.secondary)
                                .multilineTextAlignment(.center)
                                .padding()
                        }

                        Button(String(localized: "restore_purchases")) {
                            Task { await proStore.restore() }
                        }
                        .font(.subheadline)
                        .foregroundStyle(.blue)
                        .padding(.top, 4)

                        if let error = proStore.errorMessage {
                            Text(error)
                                .font(.caption)
                                .foregroundStyle(.red)
                                .multilineTextAlignment(.center)
                                .padding(.horizontal)
                        }

                        // Legal fine print (Apple requires this near the purchase button)
                        Text(String(localized: "iap_legal_notice"))
                            .font(.caption2)
                            .foregroundStyle(.tertiary)
                            .multilineTextAlignment(.center)
                            .padding(.horizontal, 24)
                            .padding(.top, 8)
                    }
                    .padding(.horizontal, 24)
                }

                Spacer().frame(height: 36)
            }
        }
        .presentationDetents([.large])
        .presentationDragIndicator(.hidden)
    }
}

// MARK: - Sub-views

private struct ProFeatureRow: View {
    let icon: String
    let color: Color
    let key: String

    var body: some View {
        HStack(spacing: 14) {
            ZStack {
                RoundedRectangle(cornerRadius: 8)
                    .fill(color.opacity(0.12))
                    .frame(width: 36, height: 36)
                Image(systemName: icon)
                    .font(.system(size: 18))
                    .foregroundStyle(color)
            }
            Text(String(localized: String.LocalizationValue(key)))
                .font(.system(size: 16, weight: .medium))
            Spacer()
            Image(systemName: "checkmark")
                .font(.caption.weight(.bold))
                .foregroundStyle(.green)
        }
    }
}

private struct PurchaseButton: View {
    let product: Product
    let action: () -> Void

    private var isAnnual: Bool { product.id == ProProductID.annual }

    var body: some View {
        Button(action: action) {
            HStack {
                VStack(alignment: .leading, spacing: 2) {
                    Text(isAnnual
                         ? String(localized: "plan_annual")
                         : String(localized: "plan_monthly"))
                        .font(.system(size: 16, weight: .semibold))
                    Text(product.displayPrice + (isAnnual
                         ? String(localized: "per_year")
                         : String(localized: "per_month")))
                        .font(.caption)
                        .opacity(0.85)
                }
                Spacer()
                if isAnnual {
                    Text(String(localized: "best_value"))
                        .font(.caption.weight(.bold))
                        .padding(.horizontal, 8)
                        .padding(.vertical, 4)
                        .background(Color.yellow.opacity(0.2))
                        .foregroundStyle(.orange)
                        .cornerRadius(8)
                }
            }
            .padding(.horizontal, 20)
            .frame(maxWidth: .infinity, minHeight: 56)
            .background(isAnnual ? Color.blue : Color(.secondarySystemBackground))
            .foregroundStyle(isAnnual ? .white : .primary)
            .cornerRadius(14)
            .overlay(
                RoundedRectangle(cornerRadius: 14)
                    .strokeBorder(isAnnual ? Color.clear : Color(.separator), lineWidth: 1)
            )
        }
    }
}
