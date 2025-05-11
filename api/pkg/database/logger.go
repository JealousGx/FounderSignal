package database

import (
	"context"
	"log"
	"time"

	"gorm.io/gorm/logger"
)

type QueryLogger struct {
	logger.Interface
}

func (l *QueryLogger) Trace(ctx context.Context, begin time.Time, fc func() (string, int64), err error) {
	elapsed := time.Since(begin)
	sql, rows := fc()

	// ANSI color codes
	green := "\033[32m"
	yellow := "\033[33m"
	cyan := "\033[36m"
	reset := "\033[0m"

	log.Printf("%s[SQL]%s %s[%s]%s %s[rows:%d]%s %s%s%s",
		cyan, reset,
		yellow, elapsed, reset,
		green, rows, reset,
		cyan, sql, reset,
	)
}
