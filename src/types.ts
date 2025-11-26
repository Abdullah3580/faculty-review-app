// src/types.ts
export type ReportedReview = {
  id: string;
  reason: string;
  reviewId: string;
  user: {
    nickname: string | null;
  };
  review: {
    id: string;
    user: { nickname: string | null };
    faculty: { name: string };
    comment: string;
    rating: number;
  };
};
