import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";

import {
  BrainCogIcon,
  EyeIcon,
  GlobeIcon,
  MonitorSmartphoneIcon,
  ServerCogIcon,
  ZapIcon,
} from "lucide-react";

// Define the features of the application
const features = [
  {
    name: "Store Your PDF Documents",
    description:
      "Keep all your important PDF files stored and easily accessible anytime, anywhere.",
    icon: GlobeIcon,
  },
  {
    name: "Blazing Fast Response",
    description:
      "Experience lightning-fast answers to your queries, ensuring you get the information you need instantly.",
    icon: ZapIcon,
  },
  {
    name: "Chat Memorization",
    description:
      "Our intelligent chatbot remembers previous interactions, providing a seamless and personalized experience.",
    icon: BrainCogIcon,
  },
  {
    name: "Interactive PDF Viewer",
    description:
      "Engage with your PDFs like never before using our intuitive and interactive viewer.",
    icon: EyeIcon,
  },
  {
    name: "Responsive Across Devices",
    description:
      "Access and chat with your PDFs seamlessly on any device whether it's your desktop, tablet, or smartphone.",
    icon: MonitorSmartphoneIcon,
  },
  {
    name: "Powerful Backend Integration",
    description:
      "Integrate seamlessly with various backend systems, ensuring smooth data flow and enhanced functionality.",
    icon: ServerCogIcon,
  },
];

export default function Home() {
  return (
    <main className="flex-1 overflow-scroll p-2 lg:p-5 bg-gradient-to-bl from-pink-400 to-indigo-400">
      <div className="bg-white py-24 sm:py-32 rounded-md drop-shadow-xl">
        <div className="flex flex-col justify-center items-center mx-auto max-w-7xl px-6 lg:px-8">
          {/* Section Header */}
          <div className="mx-auto max-w-2xl sm:text-center">
            <h2 className="text-base font-semibold leading-7 text-indigo-700">
              Your Interactive Document Companion
            </h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Transform Your PDFs Into Interactive Conversations
            </p>

            <p className="mt-6 text-lg leading-8 text-gray-700">
              Introducing{" "}
              <span className="font-bold text-indigo-700">Chat With PDF</span>
              <br />
              <br /> Upload your document, and our chatbot will answer
              questions, summarize content, and answer all your Qs. Ideal for
              everyone, <span className="text-indigo-700">
                Chat With PDF
              </span>{" "}
              turns static documents into{" "}
              <span className="font-bold">dynamic conversations</span>,
              enhancing productivity 10x fold effortlessly.
            </p>
          </div>

          {/* Get Started Button */}
          <Button asChild className="mt-10">
            <Link href="/dashboard">Get Started</Link>
          </Button>
        </div>

        {/* App Screenshot Section */}
        <div className="relative overflow-hidden pt-16">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <Image
              alt="App Screenshot"
              src="/Screenshot 2024-08-29 162659.png"
              width={2432}
              height={1442}
              className="mb-[-0%] rounded-xl shadow-2xl ring-1 ring-gray-900/10"
            />
            <div aria-hidden="true" className="relative">
              <div className="absolute inset-x-0 -bottom-0 bg-gradient-to-t from-white/95 to-transparent pt-[5%]" />
            </div>
          </div>
        </div>

        {/* Features List */}
        <div className="mt-10 mx-10">
          {/* Map over features array and render each feature */}
          <dl className="mx-auto grid max-w-2xl grid-cols-1 gap-x-6 gap-y-10 text-base leading-7 text-gray-600 sm:grid-cols-2 lg:mx-0 lg:max-w-none lg:grid-cols-3 lg:gap-x-8 lg:gap-y-16">
            {features.map((feature, index) => (
              <div
                key={index}
                className="relative pl-12 pr-4 py-6 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 ease-in-out"
              >
                {/* Feature Icon */}
                <dt className="inline font-semibold text-gray-900 dark:text-white">
                  <feature.icon
                    aria-hidden="true"
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-purple-600 dark:text-purple-400"
                  />
                </dt>
                {/* Feature Description */}
                <dd className="mt-2 text-sm text-gray-500 dark:text-gray-300">
                  {feature.description}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </main>
  );
}
