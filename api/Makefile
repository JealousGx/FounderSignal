.PHONY: reset-db seed-ideas

reset-db:
	@./scripts/reset-db.sh

seed-ideas:
	@echo "Seeding ideas..."
	@go run ./scripts/seed.go
	@echo "Ideas seeded successfully."
	@echo "You can now run the server and test the API."