package validator

import (
	"fmt"

	"github.com/go-playground/validator/v10"
)

var validate *validator.Validate

func init() {
	validate = validator.New()

}

func Validate(s interface{}) error {
	if err := validate.Struct(s); err != nil {
		return fmt.Errorf("validation errors: %v", translateValidationErrors(err))
	}

	return nil
}

func translateValidationErrors(err error) map[string]string {
	errors := make(map[string]string)

	// Check if the error is of type validator.ValidationErrors
	if validationErrors, ok := err.(validator.ValidationErrors); ok {
		for _, fieldErr := range validationErrors {
			errors[fieldErr.Field()] = fmt.Sprintf(
				"Failed validation: '%s'='%v' | Rule: %s",
				fieldErr.Field(),
				fieldErr.Value(),
				fieldErr.Tag(),
			)
		}
	} else {
		errors["general"] = fmt.Sprintf("Unexpected validation error: %v", err)
	}
	return errors
}
