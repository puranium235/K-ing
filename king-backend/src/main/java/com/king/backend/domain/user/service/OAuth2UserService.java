package com.king.backend.domain.user.service;

import com.king.backend.domain.user.dto.domain.GoogleUserDTO;
import com.king.backend.domain.user.dto.domain.OAuth2UserDTO;
import com.king.backend.domain.user.entity.UserEntity;
import com.king.backend.domain.user.errorcode.UserErrorCode;
import com.king.backend.domain.user.repository.UserRepository;
import com.king.backend.global.exception.CustomException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class OAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest oAuth2UserRequest) throws CustomException {

        OAuth2User oAuth2User = super.loadUser(oAuth2UserRequest);

        String registrationId = oAuth2UserRequest.getClientRegistration().getRegistrationId();

        UserEntity userEntity = null;

        if (registrationId.equals("google")) {
            GoogleUserDTO googleUserDTO = GoogleUserDTO.from(oAuth2User);

            userEntity = userRepository.findByGoogleIdAndStatusIn(googleUserDTO.getGoogleId(), List.of("ROLE_PENDING", "ROLE_REGISTERED"));

            if (userEntity == null) {
                userEntity = new UserEntity();
                userEntity.setGoogleId(googleUserDTO.getGoogleId());
                userEntity.setStatus("ROLE_PENDING");
            }

            userEntity.setEmail(googleUserDTO.getEmail());
            userEntity.setImageUrl(googleUserDTO.getImageUrl());

            userRepository.save(userEntity);
        }

        if (userEntity == null) {
            throw new CustomException(UserErrorCode.OAUTH2_LOGIN_FAILED);
        }

        OAuth2UserDTO oAuth2UserDTO = new OAuth2UserDTO();
        oAuth2UserDTO.setName(userEntity.getId().toString());
        oAuth2UserDTO.setAuthorities(List.of(new SimpleGrantedAuthority(userEntity.getStatus())));

        return oAuth2UserDTO;
    }
}
