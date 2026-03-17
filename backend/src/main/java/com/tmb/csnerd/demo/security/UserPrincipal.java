package com.tmb.csnerd.demo.security;

import com.tmb.csnerd.demo.model.User;
import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

@AllArgsConstructor @Getter
public class UserPrincipal extends User implements UserDetails {
    private final User user;

    @Override
    public String getPassword() {
        return user.getPwHash();
    }

    @Override
    public String getUsername() {
        return user.getUsername();
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority(user.getRole().getRoleCode()));
    }

    @Override
    public boolean isEnabled() {
        return user.isActive();
    }
}