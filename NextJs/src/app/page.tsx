"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Briefcase, Users, Wallet, MessageCircle, Sparkles, TrendingUp, Building2, UserCheck, Star, ArrowRight, Check, Shield, Zap, Globe, Clock } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  const [searchKeyword, setSearchKeyword] = useState("");
  const [searchLocation, setSearchLocation] = useState("");

  const handleSearch = () => {
    if (searchKeyword || searchLocation) {
      const params = new URLSearchParams();
      if (searchKeyword) params.set("keyword", searchKeyword);
      if (searchLocation) params.set("location", searchLocation);
      window.location.href = `/jobs?${params.toString()}`;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                PPS Jobs
              </span>
            </div>
            <div className="hidden md:flex items-center gap-6">
              <Link href="#employers" className="text-gray-600 hover:text-green-600 transition-colors">
                For Employers
              </Link>
              <Link href="#jobseekers" className="text-gray-600 hover:text-green-600 transition-colors">
                For Job Seekers
              </Link>
              <Link href="#pricing" className="text-gray-600 hover:text-green-600 transition-colors">
                Pricing
              </Link>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/auth/login">
                <Button variant="ghost" className="text-green-600 hover:text-green-700 hover:bg-green-50">
                  Login
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white">
                  Register
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-green-500 via-emerald-500 to-teal-600">
        <div className="absolute inset-0 bg-black/10" />
        <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-white/10 rounded-full blur-3xl" />

        <div className="relative container mx-auto px-4 py-20 md:py-32">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-6 bg-white/20 text-white border-white/30 hover:bg-white/30">
              <Sparkles className="w-4 h-4 mr-2" />
              Empowering Careers, Connecting Talent
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Find Your Dream Job or
              <br />
              <span className="text-green-100">Hire Top Talent</span>
            </h1>
            <p className="text-lg md:text-xl text-green-50 mb-10 max-w-2xl mx-auto">
              India's leading job portal connecting employers with the best talent. Simple, fast, and effective.
            </p>

            {/* Search Box */}
            <Card className="max-w-3xl mx-auto shadow-2xl">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <Input
                        type="text"
                        placeholder="Job title, keywords, or company"
                        value={searchKeyword}
                        onChange={(e) => setSearchKeyword(e.target.value)}
                        className="pl-10 h-12 border-gray-200 focus:border-green-500 focus:ring-green-500"
                      />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <Input
                        type="text"
                        placeholder="City, District, or State"
                        value={searchLocation}
                        onChange={(e) => setSearchLocation(e.target.value)}
                        className="pl-10 h-12 border-gray-200 focus:border-green-500 focus:ring-green-500"
                      />
                    </div>
                  </div>
                  <Button
                    onClick={handleSearch}
                    className="h-12 px-8 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold"
                  >
                    <Search className="w-5 h-5 mr-2" />
                    Search Jobs
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12">
              {[
                { icon: Building2, label: "Companies", value: "500+" },
                { icon: Briefcase, label: "Active Jobs", value: "2000+" },
                { icon: Users, label: "Job Seekers", value: "10K+" },
                { icon: Check, label: "Hirements", value: "5K+" },
              ].map((stat, index) => (
                <div key={index} className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                  <stat.icon className="w-8 h-8 text-white mb-2 mx-auto" />
                  <div className="text-2xl font-bold text-white">{stat.value}</div>
                  <div className="text-green-100 text-sm">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* For Employers Section */}
      <section id="employers" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-green-100 text-green-700 hover:bg-green-200">For Employers</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Hire the Best Talent
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Post jobs, access candidate database, and find your perfect match with our advanced hiring tools.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                icon: Briefcase,
                title: "Post Jobs",
                description: "Post up to 4 active jobs at a time. Reach thousands of qualified candidates instantly.",
                color: "from-green-500 to-emerald-500",
              },
              {
                icon: Users,
                title: "Access Database",
                description: "Browse our extensive database of job seekers and unlock candidate profiles with credits.",
                color: "from-emerald-500 to-teal-500",
              },
              {
                icon: Wallet,
                title: "Flexible Credits",
                description: "Pay only for what you use. Get 10 free credits on registration. Valid for 30 days.",
                color: "from-teal-500 to-cyan-500",
              },
            ].map((feature, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className={`w-14 h-14 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-4`}>
                    <feature.icon className="w-7 h-7 text-white" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/auth/register?role=employer">
              <Button size="lg" className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white">
                Start Hiring Now
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* For Job Seekers Section */}
      <section id="jobseekers" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-emerald-100 text-emerald-700 hover:bg-emerald-200">For Job Seekers</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Find Your Dream Job
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Create your profile, add skills and experience, and apply to thousands of jobs from top companies.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                icon: UserCheck,
                title: "Create Profile",
                description: "Build a comprehensive profile with your skills, experience, and preferences.",
                color: "from-green-500 to-emerald-500",
              },
              {
                icon: Briefcase,
                title: "Apply to Jobs",
                description: "Browse and apply to jobs that match your skills and career goals.",
                color: "from-emerald-500 to-teal-500",
              },
              {
                icon: TrendingUp,
                title: "Track Progress",
                description: "Monitor your applications and get hired by top employers across India.",
                color: "from-teal-500 to-cyan-500",
              },
            ].map((feature, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className={`w-14 h-14 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-4`}>
                    <feature.icon className="w-7 h-7 text-white" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/auth/register?role=jobseeker">
              <Button size="lg" className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white">
                Start Job Search
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Credit Plans Section */}
      <section id="pricing" className="py-20 bg-gradient-to-br from-gray-50 to-green-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-green-100 text-green-700 hover:bg-green-200">Employer Plans</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Credit Packages
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Choose the perfect plan for your hiring needs. Each unlock costs 1 credit.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                title: "Starter",
                price: "₹499",
                profiles: "120",
                features: ["120 Profile Unlocks", "Valid for 30 Days", "Basic Support", "Full Database Access"],
                popular: false,
              },
              {
                title: "Professional",
                price: "₹799",
                profiles: "240",
                features: ["240 Profile Unlocks", "Valid for 30 Days", "Priority Support", "Full Database Access", "Job Posting Feature"],
                popular: true,
              },
              {
                title: "Enterprise",
                price: "₹999",
                profiles: "360",
                features: ["360 Profile Unlocks", "Valid for 30 Days", "24/7 Support", "Full Database Access", "All Features Included"],
                popular: false,
              },
            ].map((plan, index) => (
              <Card key={index} className={`relative border-2 ${plan.popular ? 'border-green-500 shadow-xl' : 'border-gray-200 shadow-lg'} hover:shadow-xl transition-all`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-1">
                      Most Popular
                    </Badge>
                  </div>
                )}
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-2xl mb-2">{plan.title}</CardTitle>
                  <div className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                    {plan.price}
                  </div>
                  <CardDescription className="text-lg">{plan.profiles} Profile Unlocks</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                  <div className="pt-4">
                    <a
                      href="https://wa.me/919137646449?text=Hi, I'm interested in the {plan.title} plan"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full"
                    >
                      <Button className={`w-full ${plan.popular ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700' : 'bg-gray-900 hover:bg-gray-800'} text-white`}>
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Buy on WhatsApp
                      </Button>
                    </a>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-8">
            <p className="text-gray-600 mb-4">Need a custom package for your organization?</p>
            <a
              href="https://wa.me/919137646449?text=Hi, I need a custom credit package for my organization"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline" className="border-green-500 text-green-600 hover:bg-green-50">
                <MessageCircle className="w-4 h-4 mr-2" />
                Contact Admin for Custom Package
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Founder Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
              <CardContent className="p-8 md:p-12">
                <div className="flex flex-col md:flex-row items-center gap-8">
                  <div className="flex-shrink-0">
                    <div className="w-32 h-32 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                      <UserCheck className="w-16 h-16 text-white" />
                    </div>
                  </div>
                  <div className="text-center md:text-left flex-1">
                    <Star className="w-8 h-8 text-yellow-500 mx-auto md:mx-0 mb-4" />
                    <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                      Mr. Shivam Pathak
                    </h3>
                    <Badge className="mb-4 bg-green-100 text-green-700">Founder</Badge>
                    <p className="text-lg text-gray-700 italic">
                      "Empowering Careers, Connecting Talent."
                    </p>
                    <p className="text-gray-600 mt-4">
                      Welcome to PPS Jobs - your trusted partner in building successful careers and finding exceptional talent. We are committed to creating meaningful connections that drive growth and success.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose PPS Jobs?
            </h2>
          </div>

          <div className="grid md:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {[
              { icon: Zap, title: "Fast & Easy", description: "Quick registration and job posting process" },
              { icon: Shield, title: "Verified Profiles", description: "Quality checked candidates and employers" },
              { icon: Users, title: "Large Database", description: "Thousands of active job seekers" },
              { icon: Clock, title: "24/7 Support", description: "Always here to help you succeed" },
            ].map((feature, index) => (
              <Card key={index} className="text-center border-0 shadow-md hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-auto">
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                  <Briefcase className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold">PPS Jobs</span>
              </div>
              <p className="text-gray-400">
                Empowering Careers, Connecting Talent.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><Link href="/" className="text-gray-400 hover:text-white transition-colors">Home</Link></li>
                <li><Link href="/jobs" className="text-gray-400 hover:text-white transition-colors">Browse Jobs</Link></li>
                <li><Link href="/auth/register" className="text-gray-400 hover:text-white transition-colors">Register</Link></li>
                <li><Link href="/auth/login" className="text-gray-400 hover:text-white transition-colors">Login</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">For Employers</h4>
              <ul className="space-y-2">
                <li><Link href="/auth/register?role=employer" className="text-gray-400 hover:text-white transition-colors">Post a Job</Link></li>
                <li><Link href="#pricing" className="text-gray-400 hover:text-white transition-colors">Credit Plans</Link></li>
                <li><a href="https://wa.me/919137646449" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">Contact Support</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Contact Us</h4>
              <ul className="space-y-2 text-gray-400">
                <li className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4" />
                  <a href="https://wa.me/919137646449" target="_blank" rel="noopener noreferrer" className="hover:text-white">
                    WhatsApp: 9137646449
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>&copy; 2024 PPS Jobs. All rights reserved. Founded by Mr. Shivam Pathak.</p>
          </div>
        </div>
      </footer>

      {/* Floating WhatsApp Button */}
      <a
        href="https://wa.me/919137646449?text=Hi, I want to buy credits for my account."
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 bg-gradient-to-br from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-all"
        title="Buy Credits on WhatsApp"
      >
        <MessageCircle className="w-8 h-8" />
      </a>
    </div>
  );
}
