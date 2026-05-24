package com.vitaflow.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityScheme;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI vitaflowOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Vitaflow Auth API")
                        .description("Vitaflow Authentication & Authorization Service")
                        .version("v1.0.12")
                        .contact(new Contact()
                                .name("Vitaflow Team")
                                .email("dev@vitaflow.com")
                        )
                );
    }

    @Bean
    public OpenAPI openAPI() {
        return new OpenAPI()
                .components(new Components()
                        .addSecuritySchemes("bearerAuth",
                                new SecurityScheme()
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")
                        )
                );
    }
    
}