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
            return PopTask(text: sentence, category: localCategory(lower), timing: localTiming(lower), userId: "")
        }
    }

    /// Timing detection — mirrors web LOCAL_TIMING_KW
    private func localTiming(_ lower: String) -> TaskTiming {
        let todayWords  = ["today","tonight","now","asap","urgent","immediately"]
        let laterWords  = ["later","someday","eventually","no rush","future"]
        if todayWords.contains(where: { lower.contains($0) }) { return .today  }
        if laterWords.contains(where: { lower.contains($0) }) { return .later  }
        return .thisWeek
    }

    /// Category detection — mirrors web localDetectCat including email/recipient rule
    private func localCategory(_ lower: String) -> TaskCategory {
        // Email with a personal recipient → Home (same rule as web app)
        let emailWords    = ["email","mail"]
        let personalRecipients = ["mom","mum","mummy","dad","daddy","papa","mama","son","daughter",
                                  "kids","child","children","husband","wife","partner","grandma",
                                  "grandpa","granny","grandad","baby","mother","father","parents",
                                  "sibling","brother","sister","family","friend"]
        let hasEmail     = emailWords.contains(where: { lower.contains($0) })
        let hasRecipient = personalRecipients.contains(where: { lower.contains($0) })
        if hasEmail && hasRecipient { return .home }

        let workWords     = ["meeting","email","report","client","call","project","deadline",
                             "work","office","invoice","proposal","presentation","boss","budget",
                             "strategy","review","打ち合わせ","メール","クライアント","締め切り"]
        let homeWords     = ["clean","groceries","laundry","dishes","cook","repair","grocery",
                             "home","house","garden","trash","bill","rent","delivery","buy food",
                             "掃除","買い物","洗濯","料理","ゴミ","家賃"]
        let personalWords = ["exercise","run","gym","health","doctor","dentist","read","meditate",
                             "journal","friend","haircut","yoga","hobby","travel","learn",
                             "ジム","医者","歯医者","ランニング","読書"]

        if workWords.contains(where:     { lower.contains($0) }) { return .work     }
        if homeWords.contains(where:     { lower.contains($0) }) { return .home     }
        if personalWords.contains(where: { lower.contains($0) }) { return .personal }
        return .other
    }
}
