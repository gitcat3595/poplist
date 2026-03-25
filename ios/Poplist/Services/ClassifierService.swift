import Foundation

private struct ClassifiedTask: Decodable {
    let text: String
    let timing: String
    let category: String
}

private struct ClassifyResponse: Decodable {
    let tasks: [ClassifiedTask]
}

actor ClassifierService {
    static let shared = ClassifierService()

    private let apiURL = URL(string: Constants.classifyAPIURL)!

    func classify(transcript: String, lang: String = "en") async -> [PopTask] {
        let trimmed = transcript.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmed.isEmpty else { return [] }

        var request = URLRequest(url: apiURL)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.timeoutInterval = 15

        let body: [String: Any] = [
            "transcript": trimmed,
            "categories": ["Work", "Home", "Personal", "Other"],
            "defaultTiming": "This Week",
            "lang": lang
        ]

        do {
            request.httpBody = try JSONSerialization.data(withJSONObject: body)
            let (data, _) = try await URLSession.shared.data(for: request)
            let response = try JSONDecoder().decode(ClassifyResponse.self, from: data)

            return response.tasks.compactMap { item in
                guard
                    let category = TaskCategory(rawValue: item.category),
                    let timing = TaskTiming(rawValue: item.timing)
                else { return nil }
                return PopTask(text: item.text, category: category, timing: timing, userId: "")
            }
        } catch {
            // API unreachable — fall back to local keyword classifier
            return localClassify(transcript: trimmed)
        }
    }

    // MARK: - Local fallback (mirrors web app logic)

    private func localClassify(transcript: String) -> [PopTask] {
        let sentences = transcript
            .components(separatedBy: CharacterSet(charactersIn: ".,;!\n"))
            .map { $0.trimmingCharacters(in: .whitespaces) }
            .filter { !$0.isEmpty }

        return sentences.map { sentence in
            let lower = sentence.lowercased()

            let timing: TaskTiming
            if lower.contains("today") || lower.contains("now") || lower.contains("asap") || lower.contains("urgent") {
                timing = .today
            } else if lower.contains("later") || lower.contains("someday") || lower.contains("eventually") {
                timing = .later
            } else {
                timing = .thisWeek
            }

            let workWords     = ["meeting","email","report","client","call","project","deadline","work","office"]
            let homeWords     = ["clean","groceries","laundry","dishes","cook","repair","grocery","home","house","garden"]
            let personalWords = ["exercise","run","gym","health","doctor","dentist","read","meditate","journal","friend","family"]

            let category: TaskCategory
            if workWords.contains(where: { lower.contains($0) }) {
                category = .work
            } else if homeWords.contains(where: { lower.contains($0) }) {
                category = .home
            } else if personalWords.contains(where: { lower.contains($0) }) {
                category = .personal
            } else {
                category = .other
            }

            return PopTask(text: sentence, category: category, timing: timing, userId: "")
        }
    }
}
