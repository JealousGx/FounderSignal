package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"math/rand"
	"strings"
	"time"

	cfg "foundersignal/cmd/config"
	"foundersignal/internal/domain"
	"foundersignal/pkg/database"

	"github.com/google/uuid"
	"github.com/gosimple/slug"
	"github.com/joho/godotenv"
	"gorm.io/datatypes"
	"gorm.io/gorm"
)

// Test data for generating ideas
var (
	// This will be the UserID for the creator of the ideas
	ideaOwnerUserID = "user_2wtkjhN28g1uuQA3tjs00x5KDek"

	titles = []string{
		"AI-Powered Personal Finance Manager", "Smart Home Energy Optimizer", "Language Learning App with AR",
		"Remote Team Collaboration Platform", "Health Monitoring Wearable Device", "Sustainable Packaging Solution",
		"On-Demand Home Services Marketplace", "Virtual Reality Fitness Experience", "Food Waste Reduction App",
		"Blockchain-based Supply Chain Tracker", "Virtual Education Platform for Kids", "Water Conservation Smart System",
		"Personalized Career Development App", "Elderly Care Remote Monitoring", "Subscription Box for Local Artisans",
		"Mental Health Support Platform for Students", "Smart Farming Equipment with Drone Integration", "Contactless Restaurant Ordering & Payment System",
		"Peer-to-Peer Skill Exchange Network", "Customizable Travel Itinerary Generator using AI", "Decentralized Social Network on Web3",
		"AI-Powered Code Review Assistant", "No-Code Platform for Building AR Experiences", "Subscription Box for Rare International Teas",
		"Marketplace for Upcycled & Refurbished Furniture", "Platform Connecting Local Farmers to Consumers", "App for Organizing Neighborhood Cleanups & Events",
		"Skill-Sharing Platform Tailored for Seniors", "Carbon Footprint Tracker for Small & Medium Enterprises", "Platform for Trading Renewable Energy Credits",
		"AI for Optimizing Urban Green Spaces & Biodiversity", "Personalized Bedtime Story Generator for Children", "AR Treasure Hunt Game for City Exploration",
		"AI Dungeon Master for Tabletop RPGs", "Gamified Language Learning App for Professionals", "Hyperlocal Delivery Service for Small Businesses",
		"AI-Powered Recipe Generator Based on Available Ingredients", "Platform for Independent Journalists and Citizen Reporters", "Smart Pet Feeder with Health Monitoring",
		"Virtual Co-working Space with Integrated Productivity Tools", "AI Tool for Generating Marketing Copy", "Personalized Vitamin Subscription Service",
		"Ethical AI Auditor for Businesses", "Platform for Renting Out Unused Parking Spaces", "AI-Powered Music Composition Tool",
		"Community-Based Tool Lending Library", "App for Finding and Booking Local Sports Facilities", "Personalized News Aggregator with Bias Detection",
		"AI-Driven Plant Care Assistant", "Platform for Connecting Mentors and Mentees Across Industries",
	}

	descriptions = []string{
		"An AI-based application that helps users track expenses, optimize budgets, and provide personalized financial advice based on spending patterns and goals.",
		"A system that monitors and optimizes home energy usage, automatically adjusting settings based on occupancy, weather, and personal preferences to reduce bills.",
		"An innovative language learning app that uses augmented reality to create immersive learning experiences by overlaying information on real-world objects.",
		"A comprehensive platform designed to enhance collaboration for remote teams with integrated project management, communication, and virtual workspace tools.",
		"A wearable device that continuously monitors vital health metrics, provides real-time feedback, and alerts users to potential health issues before they become serious.",
		"An eco-friendly packaging solution that uses biodegradable materials and innovative designs to minimize environmental impact while maintaining product protection.",
		"A marketplace connecting skilled service providers with homeowners for various home services, from cleaning to repairs, with transparent pricing and reviews.",
		"A virtual reality platform that transforms fitness routines into immersive experiences, making workouts more engaging and enjoyable.",
		"An application that helps households and businesses track, reduce, and repurpose food waste through smart inventory management and recipe suggestions.",
		"A blockchain solution that provides end-to-end visibility in supply chains, ensuring authenticity, reducing fraud, and improving efficiency.",
		"An interactive learning platform for children that combines education with entertainment, using gamification to make learning fun and engaging.",
		"A smart water management system that monitors usage, detects leaks, and provides recommendations to conserve water in homes and businesses.",
		"A career development application that offers personalized learning paths, mentor matching, and job recommendations based on skills and career goals.",
		"A comprehensive monitoring system that helps families keep track of elderly loved ones' well-being remotely, with emergency alert capabilities.",
		"A subscription service delivering unique products from local artisans, supporting small businesses and promoting craftsmanship.",
		"A digital platform providing resources, anonymous support groups, and on-demand professional counseling specifically for student mental health issues.",
		"Advanced equipment for smart farming that uses IoT sensors, data analytics, drone imagery, and automation to optimize crop yields and resource usage.",
		"A technology solution for restaurants enabling completely contactless ordering, payment, and pickup/delivery coordination to enhance safety and efficiency.",
		"A community platform where users can exchange skills and knowledge, teaching what they know and learning what they want to acquire, fostering a collaborative environment.",
		"A travel planning app that uses AI to create highly personalized itineraries based on interests, budget, time constraints, and real-time local information.",
		"A next-generation social network built on Web3 principles, offering users greater control over their data and content monetization.",
		"An intelligent assistant that integrates with IDEs to provide real-time, AI-powered code reviews, suggesting improvements and catching potential bugs.",
		"A user-friendly platform that allows creators to build and deploy augmented reality experiences without writing any code.",
		"A curated subscription box delivering a selection of rare and exotic teas from around the world to enthusiasts and connoisseurs.",
		"An online marketplace dedicated to upcycled, recycled, and refurbished furniture, promoting sustainability and unique home decor.",
		"A direct-to-consumer platform that connects local farmers with customers in their area, ensuring fresh produce and supporting local agriculture.",
		"A mobile app designed to facilitate community engagement by helping users organize and participate in neighborhood cleanups and local events.",
		"A digital platform specifically designed for seniors to share their skills, knowledge, and experiences with others, and to learn new things.",
		"A tool for small and medium-sized enterprises to easily track, analyze, and reduce their carbon footprint, aiding in sustainability efforts.",
		"A secure and transparent platform for businesses and individuals to trade renewable energy credits and certificates.",
		"An AI-driven system that analyzes urban data to suggest optimal locations and strategies for developing and maintaining green spaces, enhancing biodiversity.",
		"An app that uses AI to generate unique and personalized bedtime stories for children based on their favorite characters, themes, and animals.",
		"An augmented reality mobile game that turns city exploration into a fun and interactive treasure hunt, with clues and challenges overlaid on the real world.",
		"An AI-powered Dungeon Master that can create and manage dynamic Dungeons & Dragons (and other TTRPG) campaigns, adapting to player choices.",
		"A language learning application that uses gamification and real-world scenarios to help professionals quickly acquire business-specific vocabulary and fluency.",
		"A rapid delivery service focusing on supporting small local businesses by providing an affordable and efficient way to reach nearby customers.",
		"An AI-driven mobile app that suggests recipes based on ingredients users already have in their pantry or fridge, minimizing food waste.",
		"A decentralized platform for independent journalists and citizen reporters to publish their work, ensuring censorship resistance and fair compensation.",
		"A smart pet feeder that dispenses food on a schedule, monitors eating habits, and provides insights into a pet's health and activity levels.",
		"A feature-rich virtual co-working environment designed to replicate the benefits of a physical office, with tools for collaboration, focus, and networking.",
		"An AI assistant that helps marketers, writers, and business owners generate compelling and effective marketing copy for ads, websites, and social media.",
		"A subscription service that delivers personalized daily vitamin packs based on individual health data, lifestyle, and dietary needs.",
		"A service providing independent audits of AI systems to ensure they are fair, transparent, accountable, and free from harmful biases.",
		"A peer-to-peer platform allowing individuals and businesses to rent out their unused parking spaces, optimizing urban space utilization.",
		"An AI tool that assists musicians and composers in creating original music across various genres by generating melodies, harmonies, and rhythms.",
		"A community-driven platform for sharing and borrowing tools, promoting a circular economy and reducing individual consumption.",
		"A mobile app for easily finding, booking, and managing access to local sports facilities like courts, fields, and swimming pools.",
		"A news aggregation app that allows users to customize their feeds and provides tools to identify potential media bias in articles.",
		"An AI-powered app that helps users care for their houseplants by identifying plants, providing watering reminders, and diagnosing issues.",
		"A comprehensive platform connecting experienced mentors with mentees across various industries for guidance, support, and career development.",
	}

	targetAudiences = []string{
		"Young professionals looking to improve financial literacy", "Homeowners concerned about energy costs and sustainability", "Language enthusiasts and students wanting immersive learning",
		"Distributed teams and remote-first companies", "Health-conscious individuals aged 25-55", "Environmentally conscious businesses and consumers",
		"Homeowners and property managers needing reliable service providers", "Fitness enthusiasts interested in technology-driven workouts", "Families, restaurants, and grocery stores concerned about food waste",
		"Manufacturing, logistics, and retail companies needing supply chain transparency", "Parents of elementary and middle school children seeking engaging educational tools", "Eco-conscious homeowners, businesses, and municipalities",
		"Professionals and students seeking career advancement and skill development", "Families with elderly members living independently or in assisted living", "Consumers interested in supporting local artisans and unique products",
		"University and college students seeking accessible mental health support", "Modern farmers and agricultural businesses looking to optimize operations", "Restaurants and food service businesses adapting to new consumer preferences",
		"Lifelong learners, hobbyists, and professionals interested in skill development", "Independent travelers and adventure seekers looking for unique experiences", "Tech-savvy individuals interested in Web3 and data sovereignty",
		"Software development teams and individual programmers", "Marketers, educators, and creators without coding skills", "Tea lovers and individuals seeking unique gourmet experiences",
		"Eco-conscious consumers and interior design enthusiasts", "Health-conscious consumers and supporters of local agriculture", "Community organizers and environmentally conscious citizens",
		"Retired individuals and active seniors looking to connect and learn", "Small to medium-sized businesses aiming for sustainability compliance", "Corporations and individuals involved in carbon offsetting and green energy",
		"Urban planners, city councils, and environmental organizations", "Parents of young children (ages 3-8)", "Tourists, families, and groups looking for interactive city activities",
		"Tabletop RPG players and game masters", "Business professionals needing to learn a new language for work", "Local retail stores, restaurants, and home-based businesses",
		"Home cooks, students, and anyone looking to reduce food waste", "Independent journalists, bloggers, and activists", "Pet owners, especially those with busy schedules or multiple pets",
		"Freelancers, remote workers, and distributed teams", "Marketing professionals, content creators, and small business owners", "Health-conscious individuals seeking personalized nutrition solutions",
		"Companies developing or deploying AI systems, and regulatory bodies", "City dwellers, commuters, and event-goers needing parking", "Musicians, composers, and content creators needing original music",
		"DIY enthusiasts, homeowners, and community groups", "Athletes, sports teams, and casual players", "Discerning news consumers seeking diverse perspectives",
		"Houseplant owners, from beginners to experienced gardeners", "Students, young professionals, and entrepreneurs seeking guidance",
	}

	statuses = []string{"active", "paused", "completed", "draft", "archived"}
	stages   = []string{"ideation", "validation", "mvp"}

	ctaButtons = []string{
		"Get Started", "Join Now", "Sign Up Free", "Learn More", "Explore Features",
		"Try for Free", "Request a Demo", "Subscribe Today", "Download App", "Claim Your Spot",
		"Register Interest", "Start Building", "Get Early Access", "Join Waitlist", "Pre-order Now",
	}

	ctaTexts = []string{
		"Join thousands of satisfied users today!", "Limited spots available - sign up now!", "No credit card required for trial.",
		"Get our 14-day free trial, cancel anytime.", "Exclusive launch pricing for early birds!", "Be the first to experience the future.",
		"Transform your workflow with our new tools.", "Unlock premium features by signing up.", "Help us shape the product - join our beta!",
		"Solve your biggest challenges with our solution.",
	}

	imageURLs = []string{
		"https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8ZGFzaGJvYXJkfGVufDB8fDB8fHww&auto=format&fit=crop&w=800&q=60",
		"https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8Y29sbGFib3JhdGlvbnxlbnwwfHwwfHx8MA&auto=format&fit=crop&w=800&q=60",
		"https://images.unsplash.com/photo-1581091226809-5003d25190c2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTF8fGFpJTIwdGVjaG5vbG9neXxlbnwwfHwwfHx8MA&auto=format&fit=crop&w=800&q=60",
		"https://images.unsplash.com/photo-1499750310107-5fef28a66643?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YmxvZ2dpbmd8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=800&q=60",
		"https://images.unsplash.com/photo-1507034589631-9433cc6bc453?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8Zml0bmVzc3xlbnwwfHwwfHx8MA&auto=format&fit=crop&w=800&q=60",
		"https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8ZWNvbW1lcmNlfGVufDB8fDB8fHww&auto=format&fit=crop&w=800&q=60",
		"https://images.unsplash.com/photo-1531545514256-b1400bc00f31?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGxlYXJuaW5nfGVufDB8fDB8fHww&auto=format&fit=crop&w=800&q=60",
		"https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fGVkdWNhdGlvbnxlbnwwfHwwfHx8MA&auto=format&fit=crop&w=800&q=60",
		"https://images.unsplash.com/photo-1542744173-8e7e53415bb0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTV8fGJ1c2luZXNzfGVufDB8fDB8fHww&auto=format&fit=crop&w=800&q=60",
		"https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjB8fHN0dWRlbnRzfGVufDB8fDB8fHww&auto=format&fit=crop&w=800&q=60",
		"", // Intentionally blank for some ideas
		"",
		"https://images.unsplash.com/photo-1519389950473-47ba0277781c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dGVjaG5vbG9neXxlbnwwfHwwfHx8MA&auto=format&fit=crop&w=800&q=60",
		"https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8c2Fhc3xlbnwwfHwwfHx8MA&auto=format&fit=crop&w=800&q=60",
		"",
		"https://images.unsplash.com/photo-1556761175-5973dc0f32e7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8cmVtb3RlJTIwd29ya3xlbnwwfHwwfHx8MA&auto=format&fit=crop&w=800&q=60",
		"https://images.unsplash.com/photo-1504384308090-c894fdcc538d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8aGVhbHRoJTIwdGVjaHxlbnwwfHwwfHx8MA&auto=format&fit=crop&w=800&q=60",
		"",
	}

	feedbackComments = []string{
		"This looks incredibly promising! When can I try it?", "I'm not sure I understand the main benefit here.",
		"Great concept, but how will it differentiate from existing solutions?", "I've been looking for something like this!",
		"The UI in the mockups looks clean and intuitive.", "What's the pricing model going to be?",
		"This could be a game-changer for [specific industry/group].", "I have some concerns about [specific aspect, e.g., privacy/scalability].",
		"Love the idea! Have you considered integrating [another feature]?", "This is a brilliant solution to a common problem.",
		"I'm excited to see how this develops.", "Could you elaborate more on the technology stack?",
		"This has huge potential. Keep up the great work!", "I'd definitely use this if it solves [my specific problem].",
		"Interesting, but the market for this might be quite niche.", "The name is catchy!",
	}

	reactionTypes = []string{"like", "dislike"}
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using environment variables")
	}

	err := database.Connect(cfg.Envs.DB)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	db := database.GetDB()

	//nolint:gosec // Use of weak random number generator is acceptable for mock data
	rand.Seed(time.Now().UnixNano())

	ctx := context.Background()

	// Shuffle titles to ensure each is used uniquely and in a random order
	shuffledTitles := make([]string, len(titles))
	copy(shuffledTitles, titles)
	rand.Shuffle(len(shuffledTitles), func(i, j int) {
		shuffledTitles[i], shuffledTitles[j] = shuffledTitles[j], shuffledTitles[i]
	})

	// Seed exactly the number of unique titles available.
	numIdeasToSeed := len(shuffledTitles)

	// Generate and insert ideas
	if err := seedIdeas(ctx, db, shuffledTitles, numIdeasToSeed); err != nil {
		log.Fatalf("Failed to seed ideas: %v", err)
	}

	fmt.Println("Successfully seeded ideas, feedback, and reactions into the database!")
}

func seedIdeas(ctx context.Context, db *gorm.DB, uniqueIdeaTitles []string, count int) error {
	fmt.Printf("Seeding %d ideas...\n", count)

	for i := 0; i < count; i++ {
		currentTitle := uniqueIdeaTitles[i]
		descIdx := rand.Intn(len(descriptions))
		audienceIdx := rand.Intn(len(targetAudiences))

		ideaCreatedAt := randomDateWithinLastTwoYears()
		ideaID := uuid.New()

		numIdeaReactions := randomInt(0, 30) // Max 30 reactions per idea
		generatedIdeaReactions, ideaLikes, ideaDislikes := generateIdeaReactions(ideaID, ideaCreatedAt, numIdeaReactions)

		// unique slug for the idea, include last part of userId at the end of the slug
		ideaSlug := slug.Make(currentTitle)

		var userIdSuffix string
		if len(ideaOwnerUserID) >= 4 {
			userIdSuffix = strings.ToLower(ideaOwnerUserID[len(ideaOwnerUserID)-4:]) // get last 4 chars and lowercase
		} else if len(ideaOwnerUserID) > 0 {
			userIdSuffix = strings.ToLower(ideaOwnerUserID) // If userId is shorter than 4 chars, use the whole thing
		}

		ideaSlug = fmt.Sprintf("%s-%s", ideaSlug, userIdSuffix)

		idea := &domain.Idea{
			Base: domain.Base{
				ID:        ideaID,
				CreatedAt: ideaCreatedAt,
				UpdatedAt: randomRecentTime(ideaCreatedAt, 30),
			},
			UserID:         ideaOwnerUserID,
			Slug:           ideaSlug,
			Title:          currentTitle,
			Description:    descriptions[descIdx],
			TargetAudience: targetAudiences[audienceIdx],
			Status:         randomElement(statuses, "active", 75),
			Stage:          randomElement(stages, "ideation", 70),
			TargetSignups:  randomInt(20, 500),
			ImageURL:       randomElement(imageURLs, "", 65),
			Likes:          ideaLikes,
			Dislikes:       ideaDislikes,
		}

		views := randomInt(0, 1000)
		signups := 0
		if views > 50 {
			signupRate := (rand.Float64() * 0.115) + 0.005
			signups = int(float64(views) * signupRate)
			if signups > views {
				signups = views
			}
		}
		if idea.Status == "completed" && signups < idea.TargetSignups/2 {
			signups = idea.TargetSignups/2 + randomInt(0, idea.TargetSignups/2)
		}

		mvp := &domain.MVPSimulator{
			IdeaID:      idea.ID,
			Headline:    idea.Title,
			Subheadline: generateSubheadline(idea.Description, 10, 25),
			CTAText:     randomOptionalElement(ctaTexts, 60),
			CTAButton:   randomElement(ctaButtons, "Learn More", 90),
			HTMLContent: generateHTMLContent(idea.Title, idea.Description, randomElement(ctaButtons, "Sign Up", 100)),
		}

		numFeedbacks := randomInt(0, 10)
		generatedFeedbacks, generatedFeedbackReactions := generateFeedbacksAndTheirReactions(idea.ID, idea.CreatedAt, numFeedbacks)

		err := db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
			if err := tx.Create(idea).Error; err != nil {
				return fmt.Errorf("failed to create idea: %w", err)
			}

			mvp.IdeaID = idea.ID
			if err := tx.Create(mvp).Error; err != nil {
				return fmt.Errorf("failed to create MVP simulator: %w", err)
			}

			if len(generatedIdeaReactions) > 0 {
				if err := tx.CreateInBatches(generatedIdeaReactions, 50).Error; err != nil {
					return fmt.Errorf("failed to create idea reactions: %w", err)
				}
			}

			if views > 0 {
				signals := generateViewSignals(idea.ID, views, idea.CreatedAt)
				if err := tx.CreateInBatches(signals, 100).Error; err != nil {
					return fmt.Errorf("failed to create signals: %w", err)
				}
			}

			if signups > 0 {
				audienceMembers := generateAudienceMembers(idea.ID, signups, idea.CreatedAt)
				if err := tx.CreateInBatches(audienceMembers, 100).Error; err != nil {
					return fmt.Errorf("failed to create audience members: %w", err)
				}
			}

			if len(generatedFeedbacks) > 0 {
				if err := tx.CreateInBatches(generatedFeedbacks, 50).Error; err != nil {
					return fmt.Errorf("failed to create feedbacks: %w", err)
				}
			}

			if len(generatedFeedbackReactions) > 0 {
				if err := tx.CreateInBatches(generatedFeedbackReactions, 100).Error; err != nil {
					return fmt.Errorf("failed to create feedback reactions: %w", err)
				}
			}

			return nil
		})

		if err != nil {
			return fmt.Errorf("failed to save idea %d ('%s'): %w", i+1, idea.Title, err)
		}

		if (i+1)%10 == 0 {
			fmt.Printf("Created %d ideas (last: '%s') with related data\n", i+1, idea.Title)
		}
	}
	return nil
}

func generateIdeaReactions(ideaID uuid.UUID, ideaCreatedAt time.Time, count int) ([]domain.IdeaReaction, int, int) {
	reactions := make([]domain.IdeaReaction, 0, count)
	likes := 0
	dislikes := 0
	reactedUserIDs := make(map[string]bool)

	for i := 0; i < count; i++ {
		userID := ideaOwnerUserID
		if reactedUserIDs[userID] {
			continue
		}

		reactionType := randomElement(reactionTypes, "like", 80)
		if reactionType == "like" {
			likes++
		} else {
			dislikes++
		}

		reactionTime := randomTimeBetween(ideaCreatedAt, time.Now())
		reactions = append(reactions, domain.IdeaReaction{
			Base: domain.Base{
				ID:        uuid.New(),
				CreatedAt: reactionTime,
				UpdatedAt: reactionTime,
			},
			IdeaID:       ideaID,
			UserID:       userID,
			ReactionType: reactionType,
		})
		reactedUserIDs[userID] = true
	}
	return reactions, likes, dislikes
}

func generateFeedbacksAndTheirReactions(ideaID uuid.UUID, ideaCreatedAt time.Time, maxTopLevelFeedbacks int) ([]domain.Feedback, []domain.FeedbackReaction) {
	allFeedbacks := make([]domain.Feedback, 0)
	allFeedbackReactions := make([]domain.FeedbackReaction, 0)

	numTopLevel := randomInt(0, maxTopLevelFeedbacks)

	for i := 0; i < numTopLevel; i++ {
		feedbackCreatedAt := randomTimeBetween(ideaCreatedAt, time.Now())
		feedbackID := uuid.New()
		commenterID := ideaOwnerUserID

		numFeedbackReactions := randomInt(0, 15)
		currentFeedbackReactions, fbLikes, fbDislikes := generateSingleFeedbackReactions(feedbackID, feedbackCreatedAt, numFeedbackReactions)
		allFeedbackReactions = append(allFeedbackReactions, currentFeedbackReactions...)

		feedback := domain.Feedback{
			Base: domain.Base{
				ID:        feedbackID,
				CreatedAt: feedbackCreatedAt,
				UpdatedAt: randomRecentTime(feedbackCreatedAt, 10),
			},
			IdeaID:   ideaID,
			UserID:   commenterID,
			Comment:  randomElement(feedbackComments, "Great idea!", 100),
			Likes:    fbLikes,
			Dislikes: fbDislikes,
		}
		allFeedbacks = append(allFeedbacks, feedback)

		if rand.Intn(100) < 30 {
			numReplies := randomInt(0, 3)
			for j := 0; j < numReplies; j++ {
				replyCreatedAt := randomTimeBetween(feedbackCreatedAt, time.Now())
				replyID := uuid.New()
				replyCommenterID := ideaOwnerUserID

				numReplyReactions := randomInt(0, 5)
				currentReplyReactions, replyLikes, replyDislikes := generateSingleFeedbackReactions(replyID, replyCreatedAt, numReplyReactions)
				allFeedbackReactions = append(allFeedbackReactions, currentReplyReactions...)

				parentID := feedback.ID
				reply := domain.Feedback{
					Base: domain.Base{
						ID:        replyID,
						CreatedAt: replyCreatedAt,
						UpdatedAt: randomRecentTime(replyCreatedAt, 5),
					},
					IdeaID:   ideaID,
					UserID:   replyCommenterID,
					Comment:  "Reply: " + randomElement(feedbackComments, "Interesting point.", 100),
					ParentID: &parentID,
					Likes:    replyLikes,
					Dislikes: replyDislikes,
				}
				allFeedbacks = append(allFeedbacks, reply)
			}
		}
	}
	return allFeedbacks, allFeedbackReactions
}

func generateSingleFeedbackReactions(feedbackID uuid.UUID, feedbackCreatedAt time.Time, count int) ([]domain.FeedbackReaction, int, int) {
	reactions := make([]domain.FeedbackReaction, 0, count)
	likes := 0
	dislikes := 0
	reactedUserIDs := make(map[string]bool)

	for i := 0; i < count; i++ {
		userID := ideaOwnerUserID
		if reactedUserIDs[userID] {
			continue
		}

		reactionType := randomElement(reactionTypes, "like", 85)
		if reactionType == "like" {
			likes++
		} else {
			dislikes++
		}
		reactionTime := randomTimeBetween(feedbackCreatedAt, time.Now())
		reactions = append(reactions, domain.FeedbackReaction{
			Base: domain.Base{
				ID:        uuid.New(),
				CreatedAt: reactionTime,
				UpdatedAt: reactionTime,
			},
			FeedbackID:   feedbackID,
			UserID:       userID,
			ReactionType: reactionType,
		})
		reactedUserIDs[userID] = true
	}
	return reactions, likes, dislikes
}

func generateViewSignals(ideaID uuid.UUID, count int, ideaCreatedAt time.Time) []domain.Signal {
	signals := make([]domain.Signal, count)
	for i := 0; i < count; i++ {
		var userID string

		roll := rand.Intn(100)
		if roll < 70 {
			userID = "user_" + uuid.New().String()[:18]
		} else if roll < 90 {
			userID = ideaOwnerUserID
		}

		metadataMap := map[string]interface{}{"source": randomTrafficSource()}
		jsonBytes, err := json.Marshal(metadataMap)
		if err != nil {
			log.Printf("Warning: Failed to marshal metadata for signal: %v", err)
			jsonBytes = []byte("{}")
		}

		signals[i] = domain.Signal{
			Base: domain.Base{
				ID:        uuid.New(),
				CreatedAt: randomTimeBetween(ideaCreatedAt, time.Now()),
				UpdatedAt: time.Now(),
			},
			IdeaID:    ideaID,
			UserID:    userID,
			EventType: "pageview",
			IPAddress: generateRandomIP(),
			UserAgent: generateRandomUserAgent(),
			Metadata:  datatypes.JSON(jsonBytes),
		}
	}
	return signals
}

func generateAudienceMembers(ideaID uuid.UUID, count int, ideaCreatedAt time.Time) []domain.AudienceMember {
	members := make([]domain.AudienceMember, count)
	for i := 0; i < count; i++ {
		members[i] = domain.AudienceMember{
			IdeaID:     ideaID,
			UserID:     "user_" + uuid.New().String()[:18],
			SignupTime: randomTimeBetween(ideaCreatedAt, time.Now()),
		}
	}
	return members
}

func generateSubheadline(description string, minWords, maxWords int) string {
	words := strings.Fields(description)
	if len(words) == 0 {
		return "Discover an amazing new idea."
	}

	numWords := randomInt(minWords, maxWords)
	if numWords <= 0 {
		numWords = randomInt(1, maxWords)
	}
	if len(words) <= numWords {
		return description
	}
	return strings.Join(words[:numWords], " ") + "..."
}

func generateHTMLContent(title, description, ctaButtonText string) string {
	featureCount := randomInt(2, 4)
	featuresHTML := ""
	featureTitles := []string{"Key Benefit", "Unique Selling Point", "Core Functionality", "Why Choose Us", "Discover More"}
	featureDescs := []string{
		"Experience unparalleled efficiency and results.", "Unlock new possibilities with our innovative approach.",
		"Seamlessly integrated to fit your lifestyle.", "Built with you in mind, for ultimate satisfaction.",
		"Join a community of forward-thinkers.", "Achieve your goals faster than ever before.",
	}

	for i := 0; i < featureCount; i++ {
		featuresHTML += fmt.Sprintf(`
            <div class="feature">
                <h3>%s %d</h3>
                <p>%s</p>
            </div>`,
			featureTitles[rand.Intn(len(featureTitles))], i+1,
			featureDescs[rand.Intn(len(featureDescs))],
		)
	}

	return fmt.Sprintf(`
        <div class="landing-page-container">
            <header class="hero-section">
                <h1>%s</h1>
                <p class="lead">%s</p>
                <button class="cta-button primary-cta">%s</button>
            </header>
            <section class="features-overview">
                <h2>Why You'll Love This</h2>
                <div class="features-grid">
                    %s
                </div>
            </section>
            <section class="social-proof">
                <!-- Placeholder for testimonials or stats -->
                <p>"This is exactly what I was looking for!" - Happy User</p>
            </section>
            <footer class="page-footer">
                <p>&copy; %d %s. All rights reserved.</p>
            </footer>
        </div>
    `, title, generateSubheadline(description, 15, 30), ctaButtonText, featuresHTML, time.Now().Year(), strings.Split(title, " ")[0])
}

func randomDateWithinLastTwoYears() time.Time {
	now := time.Now()
	daysAgo := rand.Intn(365 * 2)
	hoursAgo := rand.Intn(24)
	minutesAgo := rand.Intn(60)
	return now.AddDate(0, 0, -daysAgo).Add(-time.Duration(hoursAgo) * time.Hour).Add(-time.Duration(minutesAgo) * time.Minute)
}

func randomRecentTime(baseTime time.Time, maxDaysAgo int) time.Time {
	if maxDaysAgo <= 0 {
		return baseTime
	}
	now := time.Now()
	if baseTime.After(now) {
		baseTime = now.AddDate(0, 0, -1)
	}

	maxDuration := now.Sub(baseTime)
	if maxDuration <= 0 {
		return baseTime
	}

	return randomTimeBetween(baseTime, time.Now())
}

func randomTimeBetween(start, end time.Time) time.Time {
	if start.After(end) {
		start, end = end, start
	}
	duration := end.Sub(start)
	if duration <= 0 {
		return start
	}
	randomDuration := time.Duration(rand.Int63n(int64(duration)))
	return start.Add(randomDuration)
}

func randomElement(items []string, defaultVal string, probabilityPercent int) string {
	if len(items) == 0 {
		return defaultVal
	}
	if probabilityPercent < 0 {
		probabilityPercent = 0
	}
	if probabilityPercent > 100 {
		probabilityPercent = 100
	}

	if rand.Intn(100) < probabilityPercent {
		return items[rand.Intn(len(items))]
	}
	return defaultVal
}

func randomOptionalElement(items []string, probabilityPercent int) string {
	if len(items) == 0 {
		return ""
	}
	if probabilityPercent < 0 {
		probabilityPercent = 0
	}
	if probabilityPercent > 100 {
		probabilityPercent = 100
	}

	if rand.Intn(100) < probabilityPercent {
		return items[rand.Intn(len(items))]
	}
	return ""
}

func randomInt(min, max int) int {
	if min > max {
		min, max = max, min
	}
	if min == max {
		return min
	}
	return rand.Intn(max-min+1) + min
}

func generateRandomIP() string {
	return fmt.Sprintf("%d.%d.%d.%d",
		rand.Intn(254)+1, rand.Intn(256), rand.Intn(256), rand.Intn(254)+1)
}

var userAgentPool = []string{
	"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
	"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15",
	"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
	"Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
	"Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:125.0) Gecko/20100101 Firefox/125.0",
	"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 Edg/122.0.0.0",
	"Mozilla/5.0 (Linux; Android 13; SM-S908B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Mobile Safari/537.36",
}

func generateRandomUserAgent() string {
	if len(userAgentPool) == 0 {
		return ""
	}
	return userAgentPool[rand.Intn(len(userAgentPool))]
}

var trafficSourcePool = []string{"direct", "google", "facebook", "twitter", "linkedin", "email", "referral", "organic_search", "paid_search", "social_media_ad"}

func randomTrafficSource() string {
	if len(trafficSourcePool) == 0 {
		return "direct"
	}
	return trafficSourcePool[rand.Intn(len(trafficSourcePool))]
}
