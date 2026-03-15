import SwiftUI

struct TaskBubbleView: View {
    let task: PopTask
    let onDone: () -> Void
    let onDelete: () -> Void

    @State private var dragOffset: CGFloat = 0
    private let deleteThreshold: CGFloat = 72

    private var categoryColor: Color {
        switch task.category {
        case .work:     return .blue
        case .home:     return .green
        case .personal: return .purple
        case .other:    return .orange
        }
    }

    var body: some View {
        ZStack(alignment: .trailing) {
            // Delete affordance revealed by swipe
            if dragOffset < -deleteThreshold * 0.6 {
                Button(action: onDelete) {
                    Image(systemName: "trash.fill")
                        .foregroundStyle(.white)
                        .frame(width: deleteThreshold)
                        .frame(maxHeight: .infinity)
                }
                .background(Color.red)
                .cornerRadius(16)
            }

            // Task card
            HStack(spacing: 14) {
                Circle()
                    .fill(categoryColor)
                    .frame(width: 10, height: 10)

                VStack(alignment: .leading, spacing: 3) {
                    Text(task.text)
                        .font(.system(size: 16, weight: .medium))
                        .foregroundStyle(.primary)

                    HStack(spacing: 5) {
                        Image(systemName: task.category.sfSymbol)
                            .font(.caption2)
                        Text(task.category.rawValue)
                            .font(.caption)
                    }
                    .foregroundStyle(categoryColor)
                }

                Spacer()

                Button(action: onDone) {
                    Image(systemName: "checkmark.circle")
                        .font(.system(size: 24))
                        .foregroundStyle(categoryColor)
                }
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 14)
            .background(
                RoundedRectangle(cornerRadius: 16)
                    .fill(Color(.secondarySystemBackground))
                    .overlay(
                        RoundedRectangle(cornerRadius: 16)
                            .strokeBorder(categoryColor.opacity(0.18), lineWidth: 1)
                    )
            )
            .offset(x: dragOffset)
            .gesture(
                DragGesture(minimumDistance: 10)
                    .onChanged { value in
                        if value.translation.width < 0 {
                            dragOffset = max(value.translation.width, -deleteThreshold - 10)
                        }
                    }
                    .onEnded { value in
                        withAnimation(.spring(response: 0.3, dampingFraction: 0.7)) {
                            dragOffset = value.translation.width < -(deleteThreshold * 0.6)
                                ? -deleteThreshold
                                : 0
                        }
                    }
            )
        }
    }
}
