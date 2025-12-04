export const ERROR_MESSAGES = {

    INTERNAL_SERVER_ERROR: "An unexpected error occurred. Please try again later.",
    BAD_REQUEST: "The request could not be understood or was missing required parameters.",
    UNAUTHORIZED: "You are not authorized to access this resource.",
    FORBIDDEN: "You are not allowed to perform this action.",
    NOT_FOUND: "The requested resource could not be found.",
    INVALID_CREDENTIALS: "Invalid email or password",

    INVALID_INPUT: "The request contains invalid data.",
    MISSING_REQUIRED_FIELDS: "Required fields are missing.",
    CONFLICT: "The request could not be processed due to a conflict.",
    TOKEN_NOT_FOUND: "Token not found.",
    INVALID_TOKEN: "Invalid token.",
    EXPIRED_TOKEN: "Token expired.",
    REFRESH_TOKEN_NOT_FOUND: "Refresh token not found.",
    REFRESH_TOKEN_EXPIRED: "Refresh token expired.",
    REFRESH_TOKEN_INVALID: "Refresh token invalid.",
    REFRESH_TOKEN_USED: "Refresh token used.",
    REFRESH_TOKEN_REVOKED: "Refresh token revoked.",
    REFRESH_TOKEN_BLACKLISTED: "Refresh token blacklisted.",
} as const;