package cloudflare

import (
	"context"
	"fmt"
	"log"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/s3"
)

type R2Bucket interface {
	GetSignedURL(ctx context.Context, key, contentType string) (string, string, error)
}

type R2Config struct {
	BucketName      string
	AccountId       string
	AccessKeyId     string
	AccessKeySecret string

	R2BucketPublicUrl string

	Environment string
}

type r2Bucket struct {
	client *s3.Client
	cfg    R2Config
}

func NewR2Bucket(cfg R2Config) R2Bucket {
	s3Config, err := config.LoadDefaultConfig(context.TODO(),
		config.WithCredentialsProvider(credentials.NewStaticCredentialsProvider(cfg.AccessKeyId, cfg.AccessKeySecret, "")),
		config.WithRegion("auto"),
	)
	if err != nil {
		log.Fatal(err)
		return nil
	}

	client := s3.NewFromConfig(s3Config, func(o *s3.Options) {
		o.BaseEndpoint = aws.String(fmt.Sprintf("https://%s.r2.cloudflarestorage.com", cfg.AccountId))
	})

	return &r2Bucket{
		client: client,
		cfg:    cfg,
	}
}

func (b *r2Bucket) GetSignedURL(ctx context.Context, key, contentType string) (string, string, error) {
	presignClient := s3.NewPresignClient(b.client)

	if b.cfg.Environment != "production" {
		key = fmt.Sprintf("dev/%s", key)
	}

	presignResult, err := presignClient.PresignPutObject(ctx, &s3.PutObjectInput{
		Bucket:      aws.String(b.cfg.BucketName),
		Key:         aws.String(key),
		ContentType: aws.String(contentType),
	}, s3.WithPresignExpires(60*time.Second))

	if err != nil {
		return "", "", fmt.Errorf("failed to presign put object: %w", err)
	}

	url := fmt.Sprintf("%s/%s", b.cfg.R2BucketPublicUrl, key)

	return presignResult.URL, url, nil
}
