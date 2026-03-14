import Foundation
import AVFoundation
import Speech

@MainActor
final class VoiceService: NSObject, ObservableObject {
    @Published var transcript = ""
    @Published var isListening = false
    @Published var error: String?

    private var recognizer: SFSpeechRecognizer?
    private var recognitionRequest: SFSpeechAudioBufferRecognitionRequest?
    private var recognitionTask: SFSpeechRecognitionTask?
    private let audioEngine = AVAudioEngine()

    // MARK: - Permissions

    func requestPermissions() async -> Bool {
        let speechGranted = await withCheckedContinuation { cont in
            SFSpeechRecognizer.requestAuthorization { status in
                cont.resume(returning: status == .authorized)
            }
        }
        let micGranted = await withCheckedContinuation { cont in
            AVAudioSession.sharedInstance().requestRecordPermission { granted in
                cont.resume(returning: granted)
            }
        }
        return speechGranted && micGranted
    }

    // MARK: - Start / Stop

    func startListening(lang: String = "en") {
        guard !isListening else { return }

        transcript = ""
        error = nil

        let locale = Locale(identifier: lang == "ja" ? "ja-JP" : "en-US")
        recognizer = SFSpeechRecognizer(locale: locale)
        guard recognizer?.isAvailable == true else {
            error = "Speech recognition is not available on this device."
            return
        }

        do {
            let session = AVAudioSession.sharedInstance()
            try session.setCategory(.record, mode: .measurement, options: .duckOthers)
            try session.setActive(true, options: .notifyOthersOnDeactivation)
        } catch {
            self.error = "Could not activate audio session."
            return
        }

        recognitionRequest = SFSpeechAudioBufferRecognitionRequest()
        recognitionRequest?.shouldReportPartialResults = true
        recognitionRequest?.taskHint = .dictation

        guard let recognitionRequest else { return }

        recognitionTask = recognizer?.recognitionTask(with: recognitionRequest) { [weak self] result, error in
            Task { @MainActor in
                if let result {
                    self?.transcript = result.bestTranscription.formattedString
                }
                if error != nil || result?.isFinal == true {
                    self?.stopListening()
                }
            }
        }

        let inputNode = audioEngine.inputNode
        let format = inputNode.outputFormat(forBus: 0)
        inputNode.installTap(onBus: 0, bufferSize: 1024, format: format) { [weak self] buffer, _ in
            self?.recognitionRequest?.append(buffer)
        }

        audioEngine.prepare()
        do {
            try audioEngine.start()
            isListening = true
        } catch {
            self.error = "Microphone failed to start."
            cleanup()
        }
    }

    func stopListening() {
        guard isListening else { return }
        cleanup()
    }

    // MARK: - Private

    private func cleanup() {
        audioEngine.stop()
        audioEngine.inputNode.removeTap(onBus: 0)
        recognitionRequest?.endAudio()
        recognitionTask?.cancel()
        recognitionRequest = nil
        recognitionTask = nil
        isListening = false
        try? AVAudioSession.sharedInstance().setActive(false, options: .notifyOthersOnDeactivation)
    }
}
