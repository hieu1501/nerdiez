package com.tmb.csnerd.demo.service.user;

import com.tmb.csnerd.demo.dto.auth.RegisterRequestDTO;
import com.tmb.csnerd.demo.model.PostsVote;
import com.tmb.csnerd.demo.model.User;
import com.tmb.csnerd.demo.model.UserRole;
import com.tmb.csnerd.demo.repository.UserRepository;
import com.tmb.csnerd.demo.repository.UserRoleRepository;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.Set;

@Service
@AllArgsConstructor
public class UserCommandService {

}
