import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, HelpCircle, TrendingUp, Users, Award, Target, Zap, Crown } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const LevelUpGuide = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 py-8">
        <div className="page-container max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Your Journey to Success</h1>
            <p className="text-xl text-muted-foreground">
              Master the art of real estate success through our comprehensive level-up system
            </p>
          </div>

          {/* Introduction Section */}
          <Card className="mb-8">
            <CardContent className="pt-6">
              <h2 className="text-2xl font-semibold mb-4">Welcome to Your Growth Path</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  At Kaamupoot, we believe in rewarding excellence and growth. Our multi-level commission structure 
                  is designed to help you maximize your earnings while building a successful real estate career. 
                  This guide will walk you through each level, its requirements, and the exclusive benefits that await you.
                </p>
                <p>
                  Whether you're just starting your journey or looking to reach new heights, understanding our 
                  level-up system is crucial for your success. Each level brings new opportunities, higher 
                  commission rates, and exclusive benefits that will help you grow both personally and professionally.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* New section explaining 7% total commission structure - Moved from CommissionStructure.tsx */}
          <Card className="mb-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl flex items-center text-blue-900">
                <HelpCircle className="mr-2 h-6 w-6" />
                Understanding the 7% Total Commission Structure
              </CardTitle>
              <CardDescription className="text-blue-800">
                A detailed breakdown of how commissions are calculated and distributed across all levels.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-blue-800 space-y-3">
              <p><strong>Total Commission Pool:</strong> 7% of every property sale is allocated as commission.</p>
              <p><strong>Distribution Principle:</strong> This 7% is first used to pay the selling agent's personal commission. The remaining amount is then distributed among eligible upline team members based on their level.</p>
              
              <div className="p-3 bg-white rounded border">
                <p className="font-medium text-blue-900 mb-2">Detailed Distribution Examples:</p>
                <ul className="list-disc list-inside ml-4 space-y-1 text-xs">
                  <li><strong>If a Level 2 Agent sells:</strong> They receive 4% personal commission. The remaining 3% is distributed among their upline agents: 1st upline (1%), 2nd upline (1%), 3rd upline (0.5%), 4th upline (0.25%), 5th upline (0.25%).</li>
                  <li><strong>If a Level 3 Agent sells:</strong> They receive 5% personal commission. The remaining 2% is distributed among their upline agents: 1st upline (1%), 2nd upline (0.5%), 3rd upline (0.25%), 4th upline (0.25%).</li>
                  <li><strong>If a Level 4 Agent sells:</strong> They receive 6% personal commission. The remaining 1% is distributed among their upline agents: 1st upline (0.5%), 2nd upline (0.25%), 3rd upline (0.25%).</li>
                  <li><strong>If a Level 5 Agent sells:</strong> They receive 6.5% personal commission. The remaining 0.5% is distributed among their upline agents: 1st upline (0.25%), 2nd upline (0.25%).</li>
                  <li><strong>If a Level 6 Agent sells:</strong> They receive 6.75% personal commission. The remaining 0.25% is distributed to their 1st upline (0.25%).</li>
                  <li><strong>If a Level 7 Agent sells:</strong> They receive 7% personal commission. There is no remaining commission for upline distribution.</li>
                </ul>
              </div>
              <p className="text-xs mt-2">
                **Note:** Team commission is paid out to upline agents based on *their* individual level commission rates from the remaining pool, not a fixed percentage of the total sale for each upline position. Level 1 agents do not receive team commissions.
              </p>
            </CardContent>
          </Card>

          {/* Level 1-3 Section */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center">
                <Star className="mr-2 h-6 w-6 text-estate-gold" />
                Foundation Levels (1-3)
              </CardTitle>
              <CardDescription>
                Building your real estate career from the ground up
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="bg-muted/30 p-4 rounded-lg">
                  <h3 className="text-xl font-semibold mb-2 flex items-center">
                    <Target className="mr-2 h-5 w-5 text-estate-blue" />
                    Level 1: Getting Started
                  </h3>
                  <p className="mb-3">
                    Welcome to Kaamupoot! As a Level 1 agent, you're taking your first steps into an exciting 
                    career in real estate. This level focuses on building your foundation and understanding 
                    the basics of successful real estate practice.
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Earn 3% personal commission on your sales</li>
                    <li>Access to basic listing tools and client management systems</li>
                    <li>Maximum monthly earning potential: $10,000</li>
                  </ul>
                </div>

                <div className="bg-muted/30 p-4 rounded-lg">
                  <h3 className="text-xl font-semibold mb-2 flex items-center">
                    <TrendingUp className="mr-2 h-5 w-5 text-estate-blue" />
                    Level 2: Growth Phase
                  </h3>
                  <p className="mb-3">
                    Congratulations on reaching Level 2! This is where you start seeing the real potential of 
                    your career. You've either made 3+ sales or built a team of 5+ members, showing your 
                    commitment to growth.
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Increased personal commission to 4%</li>
                    <li>1% team commission from your growing downline</li>
                    <li>Enhanced visibility in the marketplace</li>
                    <li>Access to team building tools</li>
                    <li>Maximum monthly earning potential: $15,000</li>
                  </ul>
                </div>

                <div className="bg-muted/30 p-4 rounded-lg">
                  <h3 className="text-xl font-semibold mb-2 flex items-center">
                    <Zap className="mr-2 h-5 w-5 text-estate-blue" />
                    Level 3: Momentum Builder
                  </h3>
                  <p className="mb-3">
                    You're now a proven performer! Level 3 agents have either closed 7+ sales or built a 
                    team of 15+ members, demonstrating significant growth and leadership potential.
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>5% personal commission on your sales</li>
                    <li>2% team commission from your downline</li>
                    <li>Access to marketing automation tools</li>
                    <li>Priority support for your growing business</li>
                    <li>Maximum monthly earning potential: $25,000</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Level 4-5 Section */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center">
                <Award className="mr-2 h-6 w-6 text-estate-gold" />
                Advanced Levels (4-5)
              </CardTitle>
              <CardDescription>
                Reaching new heights in your real estate career
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="bg-muted/30 p-4 rounded-lg">
                  <h3 className="text-xl font-semibold mb-2 flex items-center">
                    <Users className="mr-2 h-5 w-5 text-estate-blue" />
                    Level 4: Leadership Excellence
                  </h3>
                  <p className="mb-3">
                    You've become a true leader in the industry! Level 4 agents have either achieved 10+ sales 
                    or built a team of 30+ members, showing exceptional leadership and business acumen.
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>6% personal commission on your sales</li>
                    <li>3% team commission from your downline</li>
                    <li>Premium analytics tools for business optimization</li>
                    <li>Exclusive coaching sessions</li>
                    <li>Maximum monthly earning potential: $40,000</li>
                  </ul>
                </div>

                <div className="bg-muted/30 p-4 rounded-lg">
                  <h3 className="text-xl font-semibold mb-2 flex items-center">
                    <Crown className="mr-2 h-5 w-5 text-estate-blue" />
                    Level 5: Elite Performer
                  </h3>
                  <p className="mb-3">
                    Welcome to the elite circle! Level 5 agents have achieved 30+ sales, demonstrating 
                    exceptional performance and market dominance.
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>6.5% personal commission on your sales</li>
                    <li>3.5% team commission from your downline</li>
                    <li>Access to exclusive VIP client tools</li>
                    <li>Regional exclusivity benefits</li>
                    <li>Maximum monthly earning potential: $60,000</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Level 6-7 Section */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center">
                <Crown className="mr-2 h-6 w-6 text-estate-gold" />
                Master Levels (6-7)
              </CardTitle>
              <CardDescription>
                Achieving legendary status in real estate
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="bg-muted/30 p-4 rounded-lg">
                  <h3 className="text-xl font-semibold mb-2 flex items-center">
                    <Star className="mr-2 h-5 w-5 text-estate-blue" />
                    Level 6: Master Achiever
                  </h3>
                  <p className="mb-3">
                    You're now among the industry's elite! Level 6 agents have achieved 50+ sales, 
                    demonstrating mastery of the real estate profession.
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>6.75% personal commission on your sales</li>
                    <li>3.75% team commission from your downline</li>
                    <li>Access to executive retreats</li>
                    <li>Exclusive leadership program participation</li>
                    <li>Maximum monthly earning potential: $100,000</li>
                  </ul>
                </div>

                <div className="bg-muted/30 p-4 rounded-lg">
                  <h3 className="text-xl font-semibold mb-2 flex items-center">
                    <Crown className="mr-2 h-5 w-5 text-estate-blue" />
                    Level 7: Legendary Status
                  </h3>
                  <p className="mb-3">
                    The pinnacle of achievement! Level 7 agents have reached 100+ sales, becoming 
                    legends in the real estate industry.
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>7% personal commission on your sales</li>
                    <li>4% team commission from your downline</li>
                    <li>Global network access</li>
                    <li>Equity opportunities</li>
                    <li>Unlimited earning potential</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Success Tips Section */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center">
                <HelpCircle className="mr-2 h-6 w-6 text-estate-gold" />
                Success Strategies
              </CardTitle>
              <CardDescription>
                Key strategies to accelerate your growth
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <h3 className="text-xl font-semibold mb-2">Building Your Path to Success</h3>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    <strong>Focus on Personal Growth:</strong> Your journey begins with personal development. 
                    Invest time in learning market trends, negotiation skills, and client relationship management. 
                    The more you grow personally, the faster you'll advance through the levels.
                  </p>
                  <p>
                    <strong>Build Your Team Strategically:</strong> Team building is a powerful way to accelerate 
                    your progress. Focus on recruiting quality agents who share your vision and work ethic. 
                    Remember, a strong team not only helps you level up faster but also creates a sustainable 
                    business model.
                  </p>
                  <p>
                    <strong>Leverage Technology:</strong> Each level brings new tools and resources. Make the most 
                    of these by fully utilizing the technology and support systems available to you. From basic 
                    listing tools to advanced analytics, these resources are designed to help you succeed.
                  </p>
                  <p>
                    <strong>Maintain Work-Life Balance:</strong> Success isn't just about numbers. It's about 
                    building a sustainable career that allows you to thrive both professionally and personally. 
                    Use the benefits at each level to create a balanced, fulfilling career.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Call to Action */}
          <Card className="bg-estate-blue text-white">
            <CardContent className="pt-6">
              <h2 className="text-2xl font-semibold mb-4">Ready to Begin Your Journey?</h2>
              <p className="mb-4">
                Your path to success starts now. Whether you're just beginning or looking to reach new heights, 
                Kaamupoot provides the tools, support, and structure you need to achieve your goals.
              </p>
              <p className="font-medium">
                Remember: Every successful agent started at Level 1. Your dedication and hard work will determine 
                how quickly you progress through the levels. Start your journey today!
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default LevelUpGuide; 