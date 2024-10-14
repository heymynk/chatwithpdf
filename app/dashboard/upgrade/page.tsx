'use client'

import { createCheckoutSession } from "@/actions/createCheckoutSession";
import { Button } from "@/components/ui/button";
import useSubscription from "@/hooks/useSubscription";
import getStripe from "@/lib/stripe-js";
import { useUser } from "@clerk/nextjs";
import { CheckIcon, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

export type UserDetails = {
    email: string;
    name: string;
}

function PricingPage() {
  const { user } = useUser();
  const router = useRouter();
  const { hasActiveMembership, loading } = useSubscription();
  const [isPending, startTransition] = useTransition();

  const handleUpgrade = () => {
    if(!user) return;

    const userDetails:  UserDetails = {
        email: user.primaryEmailAddress?.toString()!,
        name: user.fullName!,
    };

    startTransition( async () => {
        const stripe = await getStripe();

        if(hasActiveMembership){
            //Create stripe portal
        }

        const sessionId = await createCheckoutSession(userDetails);
        // await stripe?.redirectToCheckout({
        //     sessionId,
        // })
    })

  };

  return (
    <div>
      <div className="py-24 sm:py-32">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-base font-semibold leading-7 text-purple-600">
            Pricing
          </h2>
          <p className="mt-2 text-4xl font-bold text-gray-900">
            Supercharge your document experience
          </p>
        </div>

        <p className="mx-auto mt-6 max-w-2xl px-10 text-center text-lg leading-8 text-gray-700">
          Select a cost-effective plan packed with the best features to optimize
          your PDF interactions, boost productivity, and enhance your workflow.
        </p>

        <div className="max-w-xs mx-auto mt-10 grid grid-cols-1 md:grid-cols-2 md:max-w-2xl gap-8 lg:max-w-4xl">
          {/* Free Plan */}
          <div className="ring-1 ring-gray-400 p-8 h-fit pb-12 rounded-3xl">
            <h3 className="text-lg font-semibold leading-8 text-gray-900">
              Starter Plan
            </h3>
            <p className="mt-4 text-sm leading-6 text-gray-700">
              Access core features at no cost.
            </p>
            <p className="mt-6 flex items-baseline gap-x-1">
              <span className="text-4xl font-bold tracking-tight text-gray-900">
                Free
              </span>
            </p>

            <ul
              role="list"
              className="mt-8 space-y-3 text-sm leading-6 text-gray-700"
            >
              <li className="flex gap-x-3">
                <CheckIcon className="h-6 w-5 flex-none text-purple-600" />
                Manage Documents
              </li>
              <li className="flex gap-x-3">
                <CheckIcon className="h-6 w-5 flex-none text-purple-600" />
                Up to 3 messages per document
              </li>
              <li className="flex gap-x-3">
                <CheckIcon className="h-6 w-5 flex-none text-purple-600" />
                Basic AI Chat functionality
              </li>
              <li className="flex gap-x-3">
                <X className="h-6 w-5 flex-none text-red-600" />
                Document deletion
              </li>
              <li className="flex gap-x-3">
                <X className="h-6 w-5 flex-none text-red-600" />
                Advanced analytics
              </li>
              <li className="flex gap-x-3">
                <X className="h-6 w-5 flex-none text-red-600" />
                24-hour support response time
              </li>
            </ul>
            <Button className="w-full bg-gray-600 text-white shadow-sm hover:bg-gray-500 mt-6 block rounded-md px-3 py-2 text-center text-sm font-semibold leading-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-500">
              Currently Active
            </Button>
          </div>

          {/* Pro Plan */}
          <div className="ring-2 ring-purple-600 p-8 h-fit pb-12 rounded-3xl">
            <h3 className="text-lg font-semibold leading-8 text-purple-600">
              Pro Plan
            </h3>
            <p className="mt-4 text-sm leading-6 text-gray-700">
              Unlock full potential with advanced features.
            </p>
            <p className="mt-6 flex items-baseline gap-x-1">
              <span className="text-4xl font-bold tracking-tight text-gray-900">
                $3.99
              </span>
            </p>

            <ul
              role="list"
              className="mt-8 space-y-3 text-sm leading-6 text-gray-700"
            >
              <li className="flex gap-x-3">
                <CheckIcon className="h-6 w-5 flex-none text-purple-600" />
                Store up to 20 documents
              </li>
              <li className="flex gap-x-3">
                <CheckIcon className="h-6 w-5 flex-none text-purple-600" />
                Document deletion
              </li>
              <li className="flex gap-x-3">
                <CheckIcon className="h-6 w-5 flex-none text-purple-600" />
                Up to 200 messages per document
              </li>
              <li className="flex gap-x-3">
                <CheckIcon className="h-6 w-5 flex-none text-purple-600" />
                Advanced AI Chat with memory recall
              </li>
              <li className="flex gap-x-3">
                <CheckIcon className="h-6 w-5 flex-none text-purple-600" />
                Advanced analytics
              </li>
              <li className="flex gap-x-3">
                <CheckIcon className="h-6 w-5 flex-none text-purple-600" />
                24-hour support response time
              </li>
            </ul>
            <Button
              className="w-full bg-purple-600 text-white shadow-sm hover:bg-purple-500 mt-6 block rounded-md px-3 py-2 text-center text-sm font-semibold leading-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-500"
              disabled={isPending || loading}
              onClick={handleUpgrade}
            >
              {isPending || loading
                ? "Loading..."
                : hasActiveMembership
                ? "Manage Plan"
                : "Upgrade To Pro"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PricingPage;
