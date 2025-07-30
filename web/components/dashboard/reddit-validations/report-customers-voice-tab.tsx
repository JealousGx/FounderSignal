import { MessageSquare } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { RedditValidation } from "@/types/reddit-validation";

export function VoiceOfCustomerTab({
  validation,
}: {
  validation: RedditValidation;
}) {
  if (!validation.voiceOfCustomer) return null;

  const voice = validation.voiceOfCustomer;

  return (
    <div className="space-y-4">
      {/* Sentiment Overview */}
      <Card className="bg-white border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Customer Sentiment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 mb-2">
              {voice.sentiment}
            </div>
            <p className="text-sm text-gray-600">
              Overall sentiment from Reddit discussions
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Customer Quotes */}
      <Card className="bg-white border-gray-200">
        <CardHeader>
          <CardTitle>Voice of Customer</CardTitle>
          <CardDescription>Direct quotes from Reddit users</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {voice.quotes.slice(0, 10).map((quote, index) => (
              <div key={index} className="border-l-4 border-blue-500 pl-4">
                <blockquote className="text-sm text-gray-700 italic mb-2 break-words">
                  &quot;{quote.text}&quot;
                </blockquote>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs text-gray-500 gap-2">
                  <span className="break-words">
                    — u/{quote.author} in{" "}
                    <Link
                      href={quote.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline break-words"
                    >
                      r/{quote.subreddit}
                    </Link>
                  </span>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span>{quote.score} points</span>
                    <Badge
                      variant="outline"
                      className="text-xs whitespace-normal break-words max-w-[90vw]"
                    >
                      {(quote.sentiment * 100).toFixed(0)}% positive
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Common Themes */}
      <Card className="bg-white border-gray-200">
        <CardHeader>
          <CardTitle>Common Themes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {voice.commonThemes.map((theme, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="whitespace-break-spaces"
              >
                {theme}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
