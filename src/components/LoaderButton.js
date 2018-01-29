import React from "react";
import { Button, Icon } from "material-ui";
import "./LoaderButton.css";

export default ({
                    isLoading,
                    text,
                    loadingText,
                    className = "",
                    disabled = false,
                    ...props
                }) =>
    <Button
        className={`LoaderButton ${className}`}
        disabled={disabled || isLoading}
        {...props}
    >
        {isLoading && <Icon glyph="refresh" className="spinning" />}
        {!isLoading ? text : loadingText}
    </Button>;