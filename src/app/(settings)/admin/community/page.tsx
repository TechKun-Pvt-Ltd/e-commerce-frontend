"use client";

import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Spinner from "@/components/ui/spinner";
import { toast } from "sonner";
import {
  ChevronDown, ChevronUp, MessageSquare, RefreshCw,
  Search, Star, Trash2, MessageCircleReply, Users,
} from "lucide-react";
import * as reviewService from "@/services/review";
import * as qaService from "@/services/qa";
import { ReviewDetails } from "@/types/domains/review";
import { QuestionDetails } from "@/types/domains/qa";

// ─── Reviews Tab ──────────────────────────────────────────────────────────────

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`size-3 ${s <= rating ? "fill-amber-400 text-amber-400" : "text-gray-200 fill-gray-200"}`}
        />
      ))}
    </div>
  );
}

function ReviewsTab() {
  const [reviews, setReviews] = useState<ReviewDetails[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [productIdInput, setProductIdInput] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const load = async (productId?: number) => {
    setIsLoading(true);
    try {
      const res = await reviewService.getReviews(productId, undefined, 0, 50);
      if (!res.success) { toast.error(res.error); return; }
      setReviews(res.data ?? []);
      setLoaded(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    const id = productIdInput.trim() ? parseInt(productIdInput) : undefined;
    void load(id);
  };

  const handleDelete = async (reviewId: number) => {
    setDeletingId(reviewId);
    try {
      const res = await reviewService.deleteReview(reviewId);
      if (!res.success) { toast.error(res.error); return; }
      toast.success("Review deleted");
      setReviews((prev) => prev.filter((r) => r.reviewId !== reviewId));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex gap-2">
        <Input
          placeholder="Product ID (leave empty for all)"
          value={productIdInput}
          onChange={(e) => setProductIdInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          className="max-w-xs h-9 text-sm"
        />
        <Button size="sm" onClick={handleSearch} disabled={isLoading} className="gap-2 h-9">
          {isLoading ? <Spinner className="size-3.5" /> : <Search className="size-3.5" />}
          Load
        </Button>
        {loaded && (
          <Button size="sm" variant="outline" onClick={() => handleSearch()} disabled={isLoading} className="gap-2 h-9">
            <RefreshCw className="size-3.5" />
          </Button>
        )}
      </div>

      {/* Empty state */}
      {!loaded && !isLoading && (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground text-sm gap-2 rounded-xl border border-dashed">
          <Star className="size-8 opacity-20" />
          Enter a product ID or leave empty then click Load to see reviews
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-16 gap-2 text-muted-foreground text-sm">
          <Spinner className="size-4" /> Loading reviews…
        </div>
      )}

      {/* Reviews list */}
      {loaded && !isLoading && reviews.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground text-sm gap-2 rounded-xl border border-dashed">
          <Star className="size-8 opacity-20" />
          No reviews found
        </div>
      )}

      {loaded && !isLoading && reviews.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">{reviews.length} review{reviews.length !== 1 ? "s" : ""}</p>
          {reviews.map((r) => (
            <div key={r.reviewId} className="rounded-xl border bg-white p-4 flex gap-4">
              {/* Rating + meta */}
              <div className="shrink-0 flex flex-col items-center gap-1 min-w-[3rem]">
                <div className="size-10 rounded-full bg-gray-100 flex items-center justify-center text-sm font-semibold text-gray-700">
                  {r.customer?.customerName?.[0] ?? "?"}
                </div>
                <StarRow rating={r.rating} />
                <span className="text-[10px] text-muted-foreground font-mono">#{r.reviewId}</span>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold text-gray-800">{r.customer?.customerName ?? "Unknown"}</span>
                  {r.verifiedPurchase && (
                    <Badge className="text-[10px] px-1.5 py-0 bg-green-50 text-green-700 border-green-200">Verified</Badge>
                  )}
                  <span className="text-xs text-muted-foreground ml-auto">
                    {r.dateOfSubmission ? new Date(r.dateOfSubmission).toLocaleDateString() : ""}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">Product: <span className="font-medium text-gray-700">{r.productTitle}</span></p>
                <p className="text-sm text-gray-700 leading-relaxed">{r.reviewText}</p>
              </div>

              {/* Delete */}
              <div className="shrink-0">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0 text-gray-400 hover:text-red-600 hover:bg-red-50"
                  disabled={deletingId === r.reviewId}
                  onClick={() => void handleDelete(r.reviewId)}
                >
                  {deletingId === r.reviewId ? <Spinner className="size-3.5" /> : <Trash2 className="size-3.5" />}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Q&A Tab ──────────────────────────────────────────────────────────────────

function QATab() {
  const [productIdInput, setProductIdInput] = useState("");
  const [questions, setQuestions] = useState<QuestionDetails[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
  const [answerDrafts, setAnswerDrafts] = useState<Record<number, string>>({});
  const [submittingId, setSubmittingId] = useState<number | null>(null);
  const [deletingQId, setDeletingQId] = useState<number | null>(null);
  const [deletingAId, setDeletingAId] = useState<number | null>(null);
  const [currentProductId, setCurrentProductId] = useState<number | null>(null);

  const load = async (productId: number) => {
    setIsLoading(true);
    setCurrentProductId(productId);
    try {
      const res = await qaService.getQuestions(productId, 0, 50);
      if (!res.success) { toast.error(res.error); return; }
      setQuestions(res.data ?? []);
      setLoaded(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    const id = parseInt(productIdInput.trim());
    if (!id) { toast.error("Enter a valid product ID"); return; }
    void load(id);
  };

  const toggleExpand = (id: number) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleAnswer = async (questionId: number) => {
    const text = answerDrafts[questionId]?.trim();
    if (!text) { toast.error("Answer cannot be empty"); return; }
    setSubmittingId(questionId);
    try {
      const res = await qaService.postAnswer(questionId, { answerText: text });
      if (!res.success) { toast.error(res.error); return; }
      toast.success("Answer posted");
      setAnswerDrafts((prev) => ({ ...prev, [questionId]: "" }));
      if (currentProductId) void load(currentProductId);
    } finally {
      setSubmittingId(null);
    }
  };

  const handleDeleteQuestion = async (questionId: number) => {
    setDeletingQId(questionId);
    try {
      const res = await qaService.deleteQuestion(questionId);
      if (!res.success) { toast.error(res.error); return; }
      toast.success("Question deleted");
      setQuestions((prev) => prev.filter((q) => q.questionId !== questionId));
    } finally {
      setDeletingQId(null);
    }
  };

  const handleDeleteAnswer = async (answerId: number, questionId: number) => {
    setDeletingAId(answerId);
    try {
      const res = await qaService.deleteAnswer(answerId);
      if (!res.success) { toast.error(res.error); return; }
      toast.success("Answer deleted");
      setQuestions((prev) =>
        prev.map((q) =>
          q.questionId === questionId
            ? { ...q, answers: q.answers.filter((a) => a.answerId !== answerId) }
            : q
        )
      );
    } finally {
      setDeletingAId(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex gap-2">
        <Input
          placeholder="Product ID (required)"
          value={productIdInput}
          onChange={(e) => setProductIdInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          className="max-w-xs h-9 text-sm"
        />
        <Button size="sm" onClick={handleSearch} disabled={isLoading} className="gap-2 h-9">
          {isLoading ? <Spinner className="size-3.5" /> : <Search className="size-3.5" />}
          Load
        </Button>
        {loaded && (
          <Button size="sm" variant="outline" onClick={handleSearch} disabled={isLoading} className="gap-2 h-9">
            <RefreshCw className="size-3.5" />
          </Button>
        )}
      </div>

      {/* Empty / loading states */}
      {!loaded && !isLoading && (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground text-sm gap-2 rounded-xl border border-dashed">
          <MessageSquare className="size-8 opacity-20" />
          Enter a product ID and click Load to see questions
        </div>
      )}
      {isLoading && (
        <div className="flex items-center justify-center py-16 gap-2 text-muted-foreground text-sm">
          <Spinner className="size-4" /> Loading questions…
        </div>
      )}
      {loaded && !isLoading && questions.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground text-sm gap-2 rounded-xl border border-dashed">
          <MessageSquare className="size-8 opacity-20" />
          No questions for this product
        </div>
      )}

      {/* Questions */}
      {loaded && !isLoading && questions.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">{questions.length} question{questions.length !== 1 ? "s" : ""}</p>
          {questions.map((q) => {
            const isExpanded = expandedIds.has(q.questionId);
            const hasAnswers = q.answers?.length > 0;
            return (
              <div key={q.questionId} className="rounded-xl border bg-white overflow-hidden">
                {/* Question row */}
                <div className="flex items-start gap-3 p-4">
                  <div className="size-8 rounded-full bg-indigo-50 flex items-center justify-center text-xs font-semibold text-indigo-600 shrink-0 mt-0.5">
                    {q.user?.fullName?.[0] ?? "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-sm font-semibold text-gray-800">{q.user?.fullName ?? "Customer"}</span>
                      <span className="text-[10px] text-muted-foreground">{new Date(q.dateAsked).toLocaleDateString()}</span>
                      {hasAnswers && (
                        <Badge className="text-[10px] px-1.5 py-0 bg-green-50 text-green-700 border-green-200 ml-auto">
                          {q.answers.length} answer{q.answers.length !== 1 ? "s" : ""}
                        </Badge>
                      )}
                      {!hasAnswers && (
                        <Badge className="text-[10px] px-1.5 py-0 bg-amber-50 text-amber-700 border-amber-200 ml-auto">
                          Unanswered
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-700">{q.questionText}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      size="sm" variant="ghost"
                      className="h-7 w-7 p-0 text-gray-400 hover:text-red-600 hover:bg-red-50"
                      disabled={deletingQId === q.questionId}
                      onClick={() => void handleDeleteQuestion(q.questionId)}
                    >
                      {deletingQId === q.questionId ? <Spinner className="size-3" /> : <Trash2 className="size-3" />}
                    </Button>
                    <Button
                      size="sm" variant="ghost"
                      className="h-7 w-7 p-0 text-gray-400 hover:text-gray-700"
                      onClick={() => toggleExpand(q.questionId)}
                    >
                      {isExpanded ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
                    </Button>
                  </div>
                </div>

                {/* Expanded: answers + reply */}
                {isExpanded && (
                  <div className="border-t bg-gray-50 px-4 py-3 space-y-3">
                    {/* Existing answers */}
                    {q.answers?.map((a) => (
                      <div key={a.answerId} className="flex items-start gap-3 pl-3 border-l-2 border-indigo-200">
                        <div className="size-6 rounded-full bg-indigo-100 flex items-center justify-center text-[10px] font-semibold text-indigo-700 shrink-0 mt-0.5">
                          {a.user?.fullName?.[0] ?? "?"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-xs font-semibold text-gray-700">{a.user?.fullName}</span>
                            <span className="text-[10px] text-muted-foreground">{new Date(a.dateAnswered).toLocaleDateString()}</span>
                          </div>
                          <p className="text-xs text-gray-700">{a.answerText}</p>
                        </div>
                        <Button
                          size="sm" variant="ghost"
                          className="h-6 w-6 p-0 text-gray-300 hover:text-red-500 shrink-0"
                          disabled={deletingAId === a.answerId}
                          onClick={() => void handleDeleteAnswer(a.answerId, q.questionId)}
                        >
                          {deletingAId === a.answerId ? <Spinner className="size-3" /> : <Trash2 className="size-3" />}
                        </Button>
                      </div>
                    ))}

                    {/* Reply box */}
                    <div className="flex gap-2 items-end pt-1">
                      <Textarea
                        placeholder="Write your answer…"
                        value={answerDrafts[q.questionId] ?? ""}
                        onChange={(e) => setAnswerDrafts((prev) => ({ ...prev, [q.questionId]: e.target.value }))}
                        className="text-xs min-h-[60px] resize-none"
                      />
                      <Button
                        size="sm"
                        className="shrink-0 gap-1.5 h-9"
                        disabled={submittingId === q.questionId}
                        onClick={() => void handleAnswer(q.questionId)}
                      >
                        {submittingId === q.questionId ? <Spinner className="size-3" /> : <MessageCircleReply className="size-3.5" />}
                        Answer
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CommunityPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="size-9 rounded-lg bg-white border flex items-center justify-center shrink-0">
          <Users className="size-4 text-gray-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 leading-tight">Community</h1>
          <p className="text-xs text-muted-foreground">Manage customer reviews and product Q&amp;A</p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="reviews">
        <TabsList className="h-9">
          <TabsTrigger value="reviews" className="gap-1.5 text-sm">
            <Star className="size-3.5" />
            Reviews
          </TabsTrigger>
          <TabsTrigger value="qa" className="gap-1.5 text-sm">
            <MessageSquare className="size-3.5" />
            Q&amp;A
          </TabsTrigger>
        </TabsList>

        <TabsContent value="reviews" className="mt-4">
          <ReviewsTab />
        </TabsContent>
        <TabsContent value="qa" className="mt-4">
          <QATab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
