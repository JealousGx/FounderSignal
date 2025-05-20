package repository

import (
	"context"
	"errors"
	"foundersignal/internal/domain"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type ReportRepository interface {
	Create(ctx context.Context, report *domain.Report) error
	GetLatest(ctx context.Context, ideaID uuid.UUID, reportType *domain.ReportType, exclude *uuid.UUID) (*domain.Report, error)
	GetForUser(ctx context.Context, userID string, queryParams domain.QueryParams) ([]domain.Report, int64, error)
	GetByID(ctx context.Context, reportID uuid.UUID) (*domain.Report, error)
	GetForIdea(ctx context.Context, ideaID uuid.UUID) ([]domain.Report, error)
	GetReportByTypeAndTimeRange(ctx context.Context, ideaID uuid.UUID, reportType domain.ReportType, startDate, endDate time.Time) (*domain.Report, error)
	GetAll(ctx context.Context, userID string) ([]domain.Report, int64, error)
}

type reportRepository struct {
	db *gorm.DB
}

func NewReportRepository(db *gorm.DB) *reportRepository {
	return &reportRepository{db: db}
}

func (r *reportRepository) Create(ctx context.Context, report *domain.Report) error {
	return r.db.WithContext(ctx).Create(report).Error
}

func (r *reportRepository) GetLatest(ctx context.Context, ideaID uuid.UUID, reportType *domain.ReportType, exclude *uuid.UUID) (*domain.Report, error) {
	var report domain.Report
	err := r.db.WithContext(ctx).
		Where("idea_id = ? AND type = ? AND id != ?", ideaID, reportType, exclude).
		Order("date DESC").
		First(&report).Error
	if err != nil {
		return nil, err
	}
	return &report, nil
}

func (r *reportRepository) GetForUser(ctx context.Context, userID string, queryParams domain.QueryParams) ([]domain.Report, int64, error) {
	var reports []domain.Report
	query := r.db.WithContext(ctx).
		Model(&domain.Report{}).
		Joins("JOIN ideas ON ideas.id = reports.idea_id").
		Where("ideas.user_id = ?", userID).
		Preload("Idea").
		Order("reports.date DESC")

	if queryParams.FilterBy != "" {
		query = query.Where("reports.type = ?", queryParams.FilterBy)
	}

	var totalCount int64
	if err := query.Count(&totalCount).Error; err != nil {
		return nil, 0, err
	}

	orderClause := "reports.date DESC"
	switch queryParams.SortBy {
	case "newest":
		orderClause = "reports.date DESC"
	case "oldest":
		orderClause = "reports.date ASC"
	case "views":
		orderClause = "reports.views DESC"
	case "signups":
		orderClause = "reports.signups DESC"
	case "sentiment":
		orderClause = "reports.sentiment DESC"
	case "conversionRate":
		orderClause = "reports.conversion_rate DESC"
	case "validated":
		orderClause = "reports.validated DESC"
	default:
		orderClause = "reports.date DESC"
	}

	query = paginateAndOrder(query, queryParams.Limit, queryParams.Offset, orderClause)

	err := query.Find(&reports).Error
	if err != nil {
		return nil, 0, errors.New("failed to fetch reports")
	}

	return reports, totalCount, nil
}

func (r *reportRepository) GetByID(ctx context.Context, reportID uuid.UUID) (*domain.Report, error) {
	var report domain.Report
	err := r.db.WithContext(ctx).
		Preload("Idea").
		First(&report, "id = ?", reportID).Error
	if err != nil {
		return nil, err
	}
	return &report, nil
}

func (r *reportRepository) GetForIdea(ctx context.Context, ideaID uuid.UUID) ([]domain.Report, error) {
	var reports []domain.Report
	err := r.db.WithContext(ctx).
		Where("idea_id = ?", ideaID).
		Order("date DESC").
		Find(&reports).Error
	return reports, err
}

func (r *reportRepository) GetReportByTypeAndTimeRange(ctx context.Context, ideaID uuid.UUID, reportType domain.ReportType, startDate, endDate time.Time) (*domain.Report, error) {
	var report domain.Report
	err := r.db.WithContext(ctx).
		Where("idea_id = ? AND type = ? AND date BETWEEN ? AND ?", ideaID, reportType, startDate, endDate).
		First(&report).Error

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil // Return nil without error if not found
		}
		return nil, errors.New("failed to get report by type and time range")
	}

	return &report, nil
}

// For internal use only
func (r *reportRepository) GetAll(ctx context.Context, userID string) ([]domain.Report, int64, error) {
	var reports []domain.Report
	query := r.db.WithContext(ctx).
		Model(&domain.Report{}).
		Joins("JOIN ideas ON ideas.id = reports.idea_id").
		Where("ideas.user_id = ?", userID).
		Preload("Idea").
		Order("reports.date DESC")

	var totalCount int64
	if err := query.Count(&totalCount).Error; err != nil {
		return nil, 0, err
	}

	err := query.Find(&reports).Error
	if err != nil {
		return nil, 0, errors.New("failed to fetch reports")
	}

	return reports, totalCount, nil
}
