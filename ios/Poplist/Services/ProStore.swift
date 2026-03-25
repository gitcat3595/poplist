import Foundation
import StoreKit

// MARK: - Product IDs
// Create these in App Store Connect → Your App → In-App Purchases
enum ProProductID {
    static let monthly = "com.allerise.poplist.pro.monthly"
    static let annual  = "com.allerise.poplist.pro.annual"
    static let allIDs: Set<String> = [monthly, annual]
}

enum StoreError: LocalizedError {
    case failedVerification
    var errorDescription: String? { "Purchase could not be verified." }
}

// MARK: - ProStore

@MainActor
final class ProStore: ObservableObject {
    static let shared = ProStore()

    @Published var isPro       = false
    @Published var products: [Product] = []
    @Published var isLoading   = false
    @Published var errorMessage: String?

    private var updateListenerTask: Task<Void, Never>?

    init() {
        updateListenerTask = listenForTransactionUpdates()
        Task {
            await loadProducts()
            await refreshStatus()
        }
    }

    deinit {
        updateListenerTask?.cancel()
    }

    // MARK: - Public API

    var monthlyProduct: Product? { products.first { $0.id == ProProductID.monthly } }
    var annualProduct:  Product? { products.first { $0.id == ProProductID.annual  } }

    func purchase(_ product: Product) async {
        isLoading = true
        errorMessage = nil
        defer { isLoading = false }
        do {
            let result = try await product.purchase()
            switch result {
            case .success(let verification):
                let tx = try checkVerified(verification)
                await tx.finish()
                isPro = true
            case .userCancelled:
                break
            case .pending:
                errorMessage = String(localized: "purchase_pending")
            @unknown default:
                break
            }
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    func restore() async {
        isLoading = true
        errorMessage = nil
        defer { isLoading = false }
        do {
            try await AppStore.sync()
            await refreshStatus()
        } catch {
            errorMessage = String(localized: "restore_failed")
        }
    }

    // MARK: - Private

    func refreshStatus() async {
        var found = false
        for await result in Transaction.currentEntitlements {
            if case .verified(let tx) = result,
               ProProductID.allIDs.contains(tx.productID),
               tx.revocationDate == nil {
                found = true
                break
            }
        }
        isPro = found
    }

    private func loadProducts() async {
        do {
            products = try await Product.products(for: ProProductID.allIDs)
                .sorted { $0.price < $1.price }  // monthly first
        } catch {
            print("ProStore: product load failed: \(error)")
        }
    }

    private func checkVerified<T>(_ result: VerificationResult<T>) throws -> T {
        switch result {
        case .unverified: throw StoreError.failedVerification
        case .verified(let value): return value
        }
    }

    private func listenForTransactionUpdates() -> Task<Void, Never> {
        Task(priority: .background) {
            for await result in Transaction.updates {
                guard case .verified(let tx) = result else { continue }
                await MainActor.run { self.isPro = true }
                await tx.finish()
            }
        }
    }
}
