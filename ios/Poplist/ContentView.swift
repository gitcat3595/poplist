import SwiftUI

struct ContentView: View {
    @StateObject private var authVM = AuthViewModel()

    var body: some View {
        Group {
            if authVM.isLoading {
                ProgressView()
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
                    .background(Color(.systemBackground))
            } else if authVM.user != nil {
                TaskListView()
                    .environmentObject(authVM)
            } else {
                SignInView()
                    .environmentObject(authVM)
            }
        }
    }
}
