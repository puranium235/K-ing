package com.king.backend.domain.user.jwt;

import com.king.backend.domain.user.dto.domain.OAuth2UserDTO;
import com.king.backend.domain.user.errorcode.UserErrorCode;
import com.king.backend.global.exception.CustomException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@RequiredArgsConstructor
public class JWTFilter extends OncePerRequestFilter {

    private final JWTUtil jwtUtil;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        String accesToken = null;
        Cookie[] cookies = request.getCookies();
        for (Cookie cookie : cookies) {
            if (cookie.getName().equals("AccessToken")) {
                accesToken = cookie.getValue();
                break;
            }
        }

        if (accesToken == null) {
            filterChain.doFilter(request, response);
            return;
        }

        if (jwtUtil.isExpired(accesToken)) {
            throw new CustomException(UserErrorCode.ACCESSTOKEN_EXPIRED);
        }

        String type = jwtUtil.getType(accesToken);
        if (!type.equals("AccessToken")) {
            throw new CustomException(UserErrorCode.UNVALID_TOKEN);
        }

        String userId = jwtUtil.getUserId(accesToken);
        String role = jwtUtil.getRole(accesToken);

        OAuth2UserDTO oAuth2UserDTO = new OAuth2UserDTO();
        oAuth2UserDTO.setName(userId);
        oAuth2UserDTO.setAuthorities(List.of(new SimpleGrantedAuthority(role)));

        Authentication authToken = new UsernamePasswordAuthenticationToken(oAuth2UserDTO.getName(), null, oAuth2UserDTO.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(authToken);

        filterChain.doFilter(request, response);
    }
}
