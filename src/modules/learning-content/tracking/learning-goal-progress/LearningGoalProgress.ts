import type { Card } from "ts-fsrs"

export interface LearningGoalProgress extends Card {
    learningGoalName: string
    
    // prio etcs
    isBlacklisted?: boolean
    priority?: number

    // learning stuff
    lastSeenAt?: Date
    streak?: number
    lastRepetitionCorrect?: boolean
    correctRepetitionCount?: number
}