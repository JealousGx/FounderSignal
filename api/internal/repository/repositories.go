package repository

import "gorm.io/gorm"

type Repositories struct {
	Idea IdeaRepository
}

func NewRepositories(db *gorm.DB) *Repositories {
	return &Repositories{
		Idea: NewIdeasRepo(db),
	}
}
