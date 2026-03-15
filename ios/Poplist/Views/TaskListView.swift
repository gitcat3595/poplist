import SwiftUI
import FirebaseAuth

struct TaskListView: View {
    @EnvironmentObject private var authVM: AuthViewModel
    @StateObject private var store = FirestoreService()
    @StateObject private var voice = VoiceService()
    @State private var showVoiceInput = false
    @State private var showSettings = false

    private var groupedTasks: [(TaskTiming, [PopTask])] {
        let order: [TaskTiming] = [.today, .thisWeek, .later]
        return order.compactMap { timing in
            let filtered = store.tasks.filter { $0.timing == timing }
            return filtered.isEmpty ? nil : (timing, filtered)
        }
    }

    var body: some View {
        NavigationStack {
            ZStack(alignment: .bottom) {
                if store.tasks.isEmpty {
                    emptyStateView
                } else {
                    taskScrollView
                }

                // Floating mic button
                Button { showVoiceInput = true } label: {
                    Image(systemName: "mic.fill")
                        .font(.system(size: 26, weight: .semibold))
                        .foregroundStyle(.white)
                        .frame(width: 68, height: 68)
                        .background(Circle().fill(Color.blue))
                        .shadow(color: .blue.opacity(0.4), radius: 12, y: 4)
                }
                .padding(.bottom, 28)
            }
            .navigationTitle("Poplist")
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button { showSettings = true } label: {
                        Image(systemName: "person.circle")
                            .font(.system(size: 20))
                    }
                }
            }
        }
        .sheet(isPresented: $showVoiceInput) {
            VoiceInputView(onCommit: addTasks)
                .environmentObject(voice)
        }
        .sheet(isPresented: $showSettings) {
            SettingsView()
                .environmentObject(authVM)
        }
        .onAppear {
            if let uid = authVM.user?.uid {
                store.startListening(userId: uid)
            }
        }
        .onDisappear {
            store.stopListening()
        }
    }

    // MARK: - Sub-views

    private var taskScrollView: some View {
        ScrollView {
            LazyVStack(alignment: .leading, spacing: 0, pinnedViews: .sectionHeaders) {
                ForEach(groupedTasks, id: \.0) { timing, tasks in
                    Section {
                        VStack(spacing: 10) {
                            ForEach(tasks) { task in
                                TaskBubbleView(task: task) {
                                    Task { try? await store.markDone(task) }
                                } onDelete: {
                                    Task { try? await store.deleteTask(task) }
                                }
                            }
                        }
                        .padding(.horizontal, 16)
                        .padding(.bottom, 20)
                    } header: {
                        timingHeader(timing)
                    }
                }
                // Bottom padding so last tasks clear the FAB
                Color.clear.frame(height: 110)
            }
        }
    }

    private var emptyStateView: some View {
        VStack(spacing: 16) {
            Image(systemName: "mic.circle")
                .font(.system(size: 72))
                .foregroundStyle(.blue.opacity(0.35))
            Text("Tap the mic to add tasks")
                .font(.title3.weight(.medium))
                .foregroundStyle(.secondary)
            Text("Speak naturally — AI will sort them for you")
                .font(.subheadline)
                .foregroundStyle(.tertiary)
                .multilineTextAlignment(.center)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .padding(.horizontal, 40)
    }

    private func timingHeader(_ timing: TaskTiming) -> some View {
        Text(timing.rawValue.uppercased())
            .font(.caption.weight(.bold))
            .foregroundStyle(.secondary)
            .padding(.horizontal, 20)
            .padding(.vertical, 8)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(.ultraThinMaterial)
    }

    // MARK: - Actions

    private func addTasks(_ tasks: [PopTask]) async {
        guard let uid = authVM.user?.uid else { return }
        for var task in tasks {
            task.userId = uid
            try? store.addTask(task)
        }
    }
}
