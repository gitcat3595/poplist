import Foundation
import FirebaseFirestore

@MainActor
final class FirestoreService: ObservableObject {
    @Published var tasks: [PopTask] = []

    private let db = Firestore.firestore()
    private var listener: ListenerRegistration?

    func startListening(userId: String) {
        listener?.remove()
        listener = db.collection("tasks")
            .whereField("userId", isEqualTo: userId)
            .whereField("isDone", isEqualTo: false)
            .order(by: "createdAt", descending: true)
            .addSnapshotListener { [weak self] snapshot, error in
                guard let self, let documents = snapshot?.documents else { return }
                self.tasks = documents.compactMap { try? $0.data(as: PopTask.self) }
            }
    }

    func stopListening() {
        listener?.remove()
        listener = nil
    }

    func addTask(_ task: PopTask) throws {
        try db.collection("tasks").addDocument(from: task)
    }

    func markDone(_ task: PopTask) async throws {
        guard let id = task.id else { return }
        try await db.collection("tasks").document(id).updateData(["isDone": true])
    }

    func deleteTask(_ task: PopTask) async throws {
        guard let id = task.id else { return }
        try await db.collection("tasks").document(id).delete()
    }

    func updateTask(_ task: PopTask) throws {
        guard let id = task.id else { return }
        try db.collection("tasks").document(id).setData(from: task, merge: true)
    }
}
