"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { VENDORS, MENTORS, PARTNERS } from "@/lib/partner-data";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

import {
  Users,
  MapPin,
  Star,
  TrendingUp,
  Package,
  MessageSquare,
  Search,
  ArrowUpRight,
} from "lucide-react";

import { motion } from "framer-motion";

type ProfileType = "vendor" | "mentor" | "partner";

export default function PartnerMatchingPage() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState("vendors");
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("all");

  // Navigate to the corresponding dynamic profile page
  const openProfile = (type: ProfileType, id: number) => {
    router.push(`/community//partner-matching/${type}/${id}`);
  };

  const query = searchQuery.trim().toLowerCase();

  // Filter vendors
  const filteredVendors = VENDORS.filter((vendor) => {
    const matchesSearch =
      vendor.name.toLowerCase().includes(query) ||
      vendor.category.toLowerCase().includes(query) ||
      vendor.location.toLowerCase().includes(query) ||
      vendor.type.toLowerCase().includes(query);

    const matchesCategory =
      category === "all" ||
      vendor.category.toLowerCase() === category;

    return matchesSearch && matchesCategory;
  });

  // Filter mentors
  const filteredMentors = MENTORS.filter((mentor) => {
    return (
      mentor.name.toLowerCase().includes(query) ||
      mentor.expertise.toLowerCase().includes(query) ||
      mentor.language.toLowerCase().includes(query)
    );
  });

  // Filter partners
  const filteredPartners = PARTNERS.filter((partner) => {
    return (
      partner.name.toLowerCase().includes(query) ||
      partner.business.toLowerCase().includes(query) ||
      partner.location.toLowerCase().includes(query) ||
      partner.looking.toLowerCase().includes(query) ||
      partner.skills.some((skill) =>
        skill.toLowerCase().includes(query)
      )
    );
  });

  const initials = (name: string) =>
    name
      .split(" ")
      .map((word) => word[0])
      .join("");

  const EmptyState = ({ label }: { label: string }) => (
    <Card className="p-10 text-center">
      <Search className="w-10 h-10 mx-auto mb-3 text-foreground/40" />
      <h3 className="font-semibold text-lg">No {label} found</h3>
      <p className="text-sm text-foreground/60 mt-1">
        Try changing your search or filters.
      </p>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-2">
            <Users className="w-8 h-8 text-main" />
            Partner Matching
          </h1>

          <p className="text-foreground/70 mt-2">
            Find suppliers, mentors, and collaboration partners
            to grow your business.
          </p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-main/10 rounded-lg">
                <Package className="w-5 h-5 text-main" />
              </div>

              <div>
                <p className="text-2xl font-bold">450+</p>
                <p className="text-sm text-foreground/70">Vendors</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-chart-2/10 rounded-lg">
                <Users className="w-5 h-5 text-chart-2" />
              </div>

              <div>
                <p className="text-2xl font-bold">120+</p>
                <p className="text-sm text-foreground/70">Mentors</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-chart-3/10 rounded-lg">
                <TrendingUp className="w-5 h-5 text-chart-3" />
              </div>

              <div>
                <p className="text-2xl font-bold">89%</p>
                <p className="text-sm text-foreground/70">Match Rate</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-chart-4/10 rounded-lg">
                <Star className="w-5 h-5 text-chart-4" />
              </div>

              <div>
                <p className="text-2xl font-bold">4.8</p>
                <p className="text-sm text-foreground/70">Avg Rating</p>
              </div>
            </div>
          </Card>

        </div>

        {/* Search and Filters */}
        <Card className="p-4">
          <div className="flex flex-col md:flex-row gap-3">

            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/50" />

              <Input
                placeholder="Search by name, category, or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {activeTab === "vendors" && (
              <Select
                value={category}
                onValueChange={setCategory}
              >
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="all">
                    All Categories
                  </SelectItem>

                  <SelectItem value="packaging">
                    Packaging
                  </SelectItem>

                  <SelectItem value="raw materials">
                    Raw Materials
                  </SelectItem>

                  <SelectItem value="marketing">
                    Marketing
                  </SelectItem>
                </SelectContent>
              </Select>
            )}

          </div>
        </Card>

        {/* Matching Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={(value) => {
            setActiveTab(value);
            setSearchQuery("");
            setCategory("all");
          }}
        >

          <TabsList className="grid w-full md:w-[400px] grid-cols-3">
            <TabsTrigger value="vendors">Vendors</TabsTrigger>
            <TabsTrigger value="mentors">Mentors</TabsTrigger>
            <TabsTrigger value="partners">Partners</TabsTrigger>
          </TabsList>

          {/* ================= VENDORS ================= */}
          <TabsContent value="vendors" className="space-y-4 mt-6">

            {filteredVendors.length === 0 ? (
              <EmptyState label="vendors" />
            ) : (
              filteredVendors.map((vendor, idx) => (
                <motion.div
                  key={vendor.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Card className="p-6 hover:border-main transition-colors">

                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="flex-1">

                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-xl font-bold">
                                {vendor.name}
                              </h3>

                              {vendor.verified && (
                                <Badge
                                  variant="neutral"
                                  className="text-xs"
                                >
                                  ✓ Verified
                                </Badge>
                              )}
                            </div>

                            <div className="flex items-center gap-3 text-sm text-foreground/70">
                              <Badge>{vendor.type}</Badge>
                              <span>{vendor.category}</span>
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="text-2xl font-bold text-main">
                              {vendor.matchScore}%
                            </div>
                            <div className="text-xs text-foreground/70">
                              Match
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-4 text-sm mb-4">

                          <div className="flex items-center gap-1 text-foreground/70">
                            <MapPin className="w-4 h-4" />
                            {vendor.location} ({vendor.distance})
                          </div>

                          <div className="flex items-center gap-1 text-foreground/70">
                            <Star className="w-4 h-4 fill-chart-3 text-chart-3" />
                            {vendor.rating} ({vendor.reviews} reviews)
                          </div>

                          <div className="text-foreground/70">
                            Min Order: {vendor.minOrder}
                          </div>

                        </div>

                        <div className="flex flex-wrap gap-2">

                          <Button className="flex-1">
                            <MessageSquare className="w-4 h-4 mr-2" />
                            Contact
                          </Button>

                          <Button
                            variant="neutral"
                            onClick={() =>
                              openProfile("vendor", vendor.id)
                            }
                          >
                            View Profile
                            <ArrowUpRight className="w-4 h-4 ml-2" />
                          </Button>

                        </div>

                      </div>
                    </div>

                  </Card>
                </motion.div>
              ))
            )}

          </TabsContent>

          {/* ================= MENTORS ================= */}
          <TabsContent value="mentors" className="space-y-4 mt-6">

            {filteredMentors.length === 0 ? (
              <EmptyState label="mentors" />
            ) : (
              filteredMentors.map((mentor, idx) => (
                <motion.div
                  key={mentor.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Card className="p-6 hover:border-main transition-colors">

                    <div className="flex items-start gap-4">

                      <Avatar className="w-16 h-16">
                        <AvatarFallback className="bg-main/10 text-main text-xl">
                          {initials(mentor.name)}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1">

                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="text-xl font-bold">
                              {mentor.name}
                            </h3>

                            <p className="text-sm text-foreground/70">
                              {mentor.expertise}
                            </p>
                          </div>

                          <div className="text-right">
                            <div className="text-2xl font-bold text-main">
                              {mentor.matchScore}%
                            </div>

                            <div className="text-xs text-foreground/70">
                              Match
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-4 text-sm text-foreground/70 mb-4">

                          <span>{mentor.experience} experience</span>

                          <span>{mentor.language}</span>

                          <span>{mentor.sessions} sessions</span>

                          <span className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-chart-3 text-chart-3" />
                            {mentor.rating}
                          </span>

                        </div>

                        <div className="flex flex-wrap gap-2">

                          <Button>
                            <MessageSquare className="w-4 h-4 mr-2" />
                            Book Session
                          </Button>

                          <Button
                            variant="neutral"
                            onClick={() =>
                              openProfile("mentor", mentor.id)
                            }
                          >
                            View Profile
                            <ArrowUpRight className="w-4 h-4 ml-2" />
                          </Button>

                        </div>

                      </div>
                    </div>

                  </Card>
                </motion.div>
              ))
            )}

          </TabsContent>

          {/* ================= PARTNERS ================= */}
          <TabsContent value="partners" className="space-y-4 mt-6">

            {filteredPartners.length === 0 ? (
              <EmptyState label="partners" />
            ) : (
              filteredPartners.map((partner, idx) => (
                <motion.div
                  key={partner.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Card className="p-6 hover:border-main transition-colors">

                    <div className="flex items-start gap-4">

                      <Avatar className="w-16 h-16">
                        <AvatarFallback className="bg-main/10 text-main text-xl">
                          {initials(partner.name)}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1">

                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="text-xl font-bold">
                              {partner.name}
                            </h3>

                            <p className="text-sm text-foreground/70">
                              {partner.business}
                            </p>
                          </div>

                          <div className="text-right">
                            <div className="text-2xl font-bold text-main">
                              {partner.matchScore}%
                            </div>

                            <div className="text-xs text-foreground/70">
                              Match
                            </div>
                          </div>
                        </div>

                        <div className="mb-3">

                          <p className="text-sm text-foreground/70 mb-2">
                            Looking for: {partner.looking}
                          </p>

                          <div className="flex flex-wrap gap-2">
                            {partner.skills.map((skill) => (
                              <Badge
                                key={skill}
                                variant="neutral"
                              >
                                {skill}
                              </Badge>
                            ))}
                          </div>

                        </div>

                        <div className="flex items-center gap-4 text-sm text-foreground/70 mb-4">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {partner.location}
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-2">

                          <Button>
                            <MessageSquare className="w-4 h-4 mr-2" />
                            Connect
                          </Button>

                          <Button
                            variant="neutral"
                            onClick={() =>
                              openProfile("partner", partner.id)
                            }
                          >
                            View Profile
                            <ArrowUpRight className="w-4 h-4 ml-2" />
                          </Button>

                        </div>

                      </div>
                    </div>

                  </Card>
                </motion.div>
              ))
            )}

          </TabsContent>

        </Tabs>

      </div>
    </div>
  );
}
