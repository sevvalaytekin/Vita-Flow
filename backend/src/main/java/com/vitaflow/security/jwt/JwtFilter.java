package com.vitaflow.security.jwt;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.stream.Stream;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class JwtFilter extends OncePerRequestFilter {

    private final JwtProvider jwtProvider;

    public JwtFilter(JwtProvider jwtProvider) {
        this.jwtProvider = jwtProvider;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        String header = request.getHeader("Authorization");

        if (header != null && header.startsWith("Bearer ")) {

            String token = header.substring(7);

            try {

                System.out.println("HEADER = " + header); // 🔥 1

                JwtProvider.JwtPrincipal principal =
                        jwtProvider.parseAndValidate(token);

                System.out.println("PARSE OK = " + principal.email()); // 🔥 2

                var roleAuthorities = principal.roles().stream()
                        .map(SimpleGrantedAuthority::new);

                var permissionAuthorities = principal.permissions().stream()
                        .map(p -> new SimpleGrantedAuthority("PERM_" + p));

                var authorities = Stream.concat(roleAuthorities, permissionAuthorities)
                        .toList();

                var auth = new UsernamePasswordAuthenticationToken(
                        principal,
                        null,
                        authorities
                );

                SecurityContextHolder.getContext().setAuthentication(auth);

            } catch (Exception ex) {

                ex.printStackTrace(); // 🔥 3 (EN KRİTİK)

                SecurityContextHolder.clearContext();
            }
        }

        filterChain.doFilter(request, response);
    }
}