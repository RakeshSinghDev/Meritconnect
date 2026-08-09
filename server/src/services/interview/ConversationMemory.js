export default class ConversationMemory {

    static addMessage(session, role, content, questionType = "") {

        session.conversationHistory.push({

            role,

            content,

            questionType,

            timestamp: new Date(),

        });

    }

    static getConversation(session) {

        return session.conversationHistory
            .map((msg) => `${msg.role}: ${msg.content}`)
            .join("\n");

    }

}