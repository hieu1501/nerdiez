package com.tmb.csnerd.demo.domain.security;

import com.tmb.csnerd.demo.domain.models.User;
import jakarta.persistence.Entity;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.jspecify.annotations.NullMarked;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

@RequiredArgsConstructor
@Getter
public class UserPrincipal implements UserDetails {
    private final User user;

    @Override
    public String getPassword() {
        return user.getPwHash();
    }

    @Override
    @NullMarked
    public String getUsername() {
        return user.getUsername();
    }

    @Override
    @NullMarked
    public Collection<? extends GrantedAuthority> getAuthorities() {
        GrantedAuthority grantedAuthority = new SimpleGrantedAuthority(user.getRole().getRoleCode());
        return List.of(grantedAuthority);
    }

    @Override
    public boolean isEnabled() {
        return user.isActive();
    }

    public String getSubject() {
        return user.getSubject();
    }
}