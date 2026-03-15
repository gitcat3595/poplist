import Foundation
import FirebaseFirestore

enum TaskCategory: String, Codable, CaseIterable {
    case work = "Work"
    case home = "Home"
    case personal = "Personal"
    case other = "Other"

    var sfSymbol: String {
        switch self {
        case .work:     return "briefcase.fill"
        case .home:     return "house.fill"
        case .personal: return "person.fill"
        case .other:    return "tag.fill"
        }
    }
}

enum TaskTiming: String, Codable, CaseIterable {
    case today    = "Today"
    case thisWeek = "This Week"
    case later    = "Later"
}

struct PopTask: Identifiable, Codable {
    @DocumentID var id: String?
    var text: String
    var category: TaskCategory
    var timing: TaskTiming
    var isDone: Bool
    var userId: String
    var createdAt: Date

    init(
        id: String? = nil,
        text: String,
        category: TaskCategory,
        timing: TaskTiming,
        isDone: Bool = false,
        userId: String,
        createdAt: Date = .now
    ) {
        self.id = id
        self.text = text
        self.category = category
        self.timing = timing
        self.isDone = isDone
        self.userId = userId
        self.createdAt = createdAt
    }
}
