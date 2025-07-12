"use client"

import { cn } from "@/lib/utils"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { vapi } from "@/lib/vapi.sdk"
import { interviewer } from "@/constants"

enum CallStatus {
    INACTIVE = "INACTIVE",
    CONNECTING = "CONNECTING",
    ACTIVE = "ACTIVE",
    FINISHED = "FINISHED",
}

interface SavedMessage {
    role: "user" | "system" | "assistant",
    content: string;
}

const Agent = ({ userName, userId, type, interviewId, questions }: AgentProps) => {
    const router = useRouter()
    const [isSpeaking, setIsSpeaking] = useState(false)
    const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE)
    const [messages, setMessages] = useState<SavedMessage[]>([])

    useEffect(() => {
        const callStart = () => setCallStatus(CallStatus.ACTIVE)
        const callEnd = () => setCallStatus(CallStatus.FINISHED)

        const onMessage = (message: Message) => {
            if (message.type === "transcript" && message.transcriptType === "final") {
                const newMessage = { role: message.role, content: message.transcript }
                setMessages(prev => [...prev, newMessage])
            }
        }
        const onSpeechStart = () => setIsSpeaking(true)
        const onSpeechEnd = () => setIsSpeaking(false)

        const onError = (error: Error) => {
            console.error("Error in call:", error)
            setCallStatus(CallStatus.INACTIVE)
        }

        vapi.on("call-start", callStart)
        vapi.on("call-end", callEnd)
        vapi.on("message", onMessage)
        vapi.on("speech-start", onSpeechStart)
        vapi.on("speech-end", onSpeechEnd)
        vapi.on("error", onError)

        return () => {
            vapi.off("call-start", callStart)
            vapi.off("call-end", callEnd)
            vapi.off("message", onMessage)
            vapi.off("speech-start", onSpeechStart)
            vapi.off("speech-end", onSpeechEnd)
            vapi.off("error", onError)
        }
    }, [])

    const handleGenerateFeedback = async (messages: SavedMessage[]) => {
        console.log("Generating feedback for messages:", messages)
        const { success, id } = {
            success: true,
            id: "feedback-id"
        }
        if (success && id) {
            router.push(`/interview/${interviewId}/feedback/${id}`)
        } else {
            console.error("Failed to generate feedback")
            router.push("/")
        }
    }

    useEffect(() => {
        if (callStatus === CallStatus.FINISHED) {
            if (type === "generate") {
                router.push("/")
            } else {
                handleGenerateFeedback(messages)
            }
        }

    }, [messages, callStatus, type, userId])

    const handleCall = async () => {
        setCallStatus(CallStatus.CONNECTING)
        if (type === "generate") {
            await vapi.start(process.env.NEXT_PUBLIC_VAPI_ID!, {
                variableValues: {
                    username: userName,
                    userid: userId,
                }
            })
        } else {
            let formattedQuestions = ""
            if(questions) {
                formattedQuestions = questions.map((question) => `- ${question}`).join("\n")
            }
            await vapi.start(interviewer, {
                variableValues: {
                    questions: formattedQuestions,
                }
            })
        }
    }

    const handleDisconnect = async () => {
        setCallStatus(CallStatus.FINISHED);
        vapi.stop();
    }

    const lastMessage = messages[messages.length - 1]?.content
    const isCallInactiveOrFinished = callStatus === CallStatus.INACTIVE || callStatus === CallStatus.FINISHED;

    return (
        <>
            <div className="call-view">
                {/* ai inteview card */}
                <div className="card-interviewer">
                    <div className="avatar">
                        <Image src="/ai-avatar.png" alt="profile-image" width={65} height={54} className="object-cover" />
                        {isSpeaking && <span className="animate-speak" />}
                    </div>
                    <h3>AI Interviewer</h3>
                </div>
                <div className="card-border">
                    <div className="card-content">
                        <Image src="/user-avatar.png" alt="user-avatar" width={540} height={540} className="rounded-full object-cover size-[120px]" />
                        <h3>{userName}</h3>
                    </div>
                </div>
            </div>
            {messages.length > 0 && (
                <div className="transcript-border">
                    <div className="transcript">
                        <p key={lastMessage} className={cn('transition-opacity duration-500 opacity-0', 'animate-fadeIn, opacity-100')}>
                            {lastMessage}
                        </p>
                    </div>
                </div>
            )}
            <div className="w-full flex justify-center items-center">
                {callStatus !== "ACTIVE" ? (
                    <button className="relative btn-call" onClick={handleCall} disabled={callStatus === CallStatus.CONNECTING}>
                        <span className={cn('absolute animate-ping rounded-full opacity-75', callStatus !== 'CONNECTING' && 'hidden')} />
                        <span>
                            {isCallInactiveOrFinished ? "Call" : ". . ."}
                        </span>
                    </button>
                ) : (
                    <button className="btn-disconnect" onClick={handleDisconnect}>
                        <span>End Call</span>
                    </button>
                )}
            </div>
        </>
    )
}

export default Agent