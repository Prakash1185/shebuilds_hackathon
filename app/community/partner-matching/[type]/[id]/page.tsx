
"use client";

import { useParams, useRouter } from "next/navigation";
import { getProfile } from "@/lib/partner-data";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  MapPin,
  Star,
  Briefcase,
  Users,
  Calendar,
  CheckCircle2,
  Package,
  Languages,
  Target,
  Clock,
} from "lucide-react";

export default function ProfilePage() {
  const params = useParams();
  const router = useRouter();

  const type = params.type as string;
  const id = params.id as string;

  const profile = getProfile(type, id);

  if (!profile) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 p-6">
        <h1 className="text-2xl font-bold">Profile Not Found</h1>
        <p className="text-muted-foreground">
          This profile doesn't exist or may have been removed.
        </p>
        <Button onClick={() => router.push("/community//partner-matching")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Partner Matching
        </Button>
      </div>
    );
  }

  const isVendor = "category" in profile;
  const isMentor = "expertise" in profile;
  const isPartner = "business" in profile;

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 md:p-8">

      {/* Back Navigation */}
      <Button
        variant="neutral"
        onClick={() => router.push("/community//partner-matching")}
        className="gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Partner Matching
      </Button>

      {/* Profile Header */}
      <Card className="overflow-hidden">
        <div className="h-2 bg-primary" />

        <CardContent className="p-6 md:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-center">

            {/* Avatar */}
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-3xl font-bold text-primary">
              {profile.name.charAt(0)}
            </div>

            {/* Basic Information */}
            <div className="flex-1 space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold md:text-3xl">
                  {profile.name}
                </h1>

                {"verified" in profile && profile.verified && (
                  <Badge className="gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Verified
                  </Badge>
                )}
              </div>

              <p className="text-muted-foreground">
                {isVendor
                  ? profile.category
                  : isMentor
                    ? profile.expertise
                    : profile.business}
              </p>

              <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                {"location" in profile && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {profile.location}
                  </span>
                )}

                {"rating" in profile && (
                  <span className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    {profile.rating}
                  </span>
                )}

                <Badge variant="neutral" className="capitalize">
                  {type}
                </Badge>
              </div>
            </div>

            {/* Match Score */}
            <div className="rounded-2xl bg-primary/5 p-5 text-center md:min-w-32">
              <p className="text-3xl font-bold text-primary">
                {profile.matchScore}%
              </p>
              <p className="text-sm text-muted-foreground">
                Match Score
              </p>
            </div>

          </div>
        </CardContent>
      </Card>

      {/* Profile Details */}
      <div className="grid gap-6 lg:grid-cols-3">

        <div className="space-y-6 lg:col-span-2">

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-primary" />
                Profile Details
              </CardTitle>
            </CardHeader>

            <CardContent className="grid gap-5 sm:grid-cols-2">

              {/* Vendor Details */}
              {isVendor && (
                <>
                  <Detail
                    icon={<Package />}
                    label="Provider Type"
                    value={profile.type}
                  />

                  <Detail
                    icon={<Briefcase />}
                    label="Category"
                    value={profile.category}
                  />

                  <Detail
                    icon={<MapPin />}
                    label="Location"
                    value={profile.location}
                  />

                  <Detail
                    icon={<MapPin />}
                    label="Distance"
                    value={profile.distance}
                  />

                  <Detail
                    icon={<Star />}
                    label="Rating"
                    value={`${profile.rating} / 5`}
                  />

                  <Detail
                    icon={<Users />}
                    label="Customer Reviews"
                    value={profile.reviews}
                  />

                  <Detail
                    icon={<Package />}
                    label="Minimum Order"
                    value={profile.minOrder}
                  />
                </>
              )}

              {/* Mentor Details */}
              {isMentor && (
                <>
                  <Detail
                    icon={<Briefcase />}
                    label="Expertise"
                    value={profile.expertise}
                  />

                  <Detail
                    icon={<Clock />}
                    label="Experience"
                    value={profile.experience}
                  />

                  <Detail
                    icon={<Languages />}
                    label="Languages"
                    value={profile.language}
                  />

                  <Detail
                    icon={<Users />}
                    label="Sessions Conducted"
                    value={profile.sessions}
                  />

                  <Detail
                    icon={<Star />}
                    label="Rating"
                    value={`${profile.rating} / 5`}
                  />

                  <Detail
                    icon={<Calendar />}
                    label="Availability"
                    value={profile.availability}
                  />
                </>
              )}

              {/* Partner Details */}
              {isPartner && (
                <>
                  <Detail
                    icon={<Briefcase />}
                    label="Business"
                    value={profile.business}
                  />

                  <Detail
                    icon={<MapPin />}
                    label="Location"
                    value={profile.location}
                  />

                  <Detail
                    icon={<Target />}
                    label="Looking For"
                    value={profile.looking}
                  />

                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Skills
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {profile.skills.map((skill) => (
                        <Badge key={skill} variant="neutral">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </>
              )}

            </CardContent>
          </Card>

        </div>

        {/* Connect Section */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Connect</CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Interested in collaborating? Connect and explore
                opportunities together.
              </p>

              <Button
                className="w-full"
                onClick={() => alert("Demo: Connection request sent!")}
              >
                <Users className="mr-2 h-4 w-4" />
                Connect
              </Button>

              {isMentor && (
                <Button
                  variant="neutral"
                  className="w-full"
                  onClick={() => alert("Demo: Session request sent!")}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  Book Session
                </Button>
              )}

              {isVendor && (
                <Button
                  variant="neutral"
                  className="w-full"
                  onClick={() => alert("Demo: Enquiry sent!")}
                >
                  <Briefcase className="mr-2 h-4 w-4" />
                  Send Enquiry
                </Button>
              )}

              {isPartner && (
                <Button
                  variant="neutral"
                  className="w-full"
                  onClick={() => alert("Demo: Collaboration request sent!")}
                >
                  <Users className="mr-2 h-4 w-4" />
                  Collaborate
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}

function Detail({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="rounded-lg bg-primary/10 p-2 text-primary">
        {icon}
      </div>

      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="font-medium">{value}</p>
      </div>
    </div>
  );
}
