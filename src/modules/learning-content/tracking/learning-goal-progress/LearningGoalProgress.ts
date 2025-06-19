export interface LearningGoalProgress {
    learningGoalName: string
    
    // prio etcs
    isBlacklisted?: boolean
    priority?: number

    // learning stuff
    lastSeenAt?: Date
    repetitions?: number
    streak?: number
    lastRepetitionCorrect?: boolean
    correctRepetitionCount?: number
}