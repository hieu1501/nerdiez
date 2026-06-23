package com.tmb.csnerd.demo.services.auth;

import com.tmb.csnerd.demo.repositories.UserRepository;
import com.tmb.csnerd.demo.security.UserPrincipal;
import lombok.AllArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class UserPrincipalService implements UserDetailsService {
    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        UserPrincipal user = userRepository.findByUsername(username).map(UserPrincipal::new).orElseThrow(() -> new UsernameNotFoundException(username));
        return user;
    }
}
