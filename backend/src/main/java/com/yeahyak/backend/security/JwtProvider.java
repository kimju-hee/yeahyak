package com.yeahyak.backend.security;

import com.yeahyak.backend.entity.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import java.security.Key;
import java.util.Date;
import org.springframework.stereotype.Component;

@Component
public class JwtProvider {

  private final Key key = Keys.secretKeyFor(SignatureAlgorithm.HS256);
  private final long ACCESS_EXPIRE = 1000L * 60 * 15; // 15분
  private final long REFRESH_EXPIRE = 1000L * 60 * 60 * 24 * 7; // 7일

  public String createAccessToken(User user) {
    return Jwts.builder()
        .setSubject(user.getEmail())
        .claim("uid", user.getUserId())
        .claim("role", user.getRole().name())
        .setIssuedAt(new Date(System.currentTimeMillis()))
        .setExpiration(new Date(System.currentTimeMillis() + ACCESS_EXPIRE))
        .signWith(key, SignatureAlgorithm.HS256)
        .compact();
  }

  public String createRefreshToken(User user) {
    return Jwts.builder()
        .setSubject(user.getEmail())
        .setIssuedAt(new Date(System.currentTimeMillis()))
        .setExpiration(new Date(System.currentTimeMillis() + REFRESH_EXPIRE))
        .signWith(key, SignatureAlgorithm.HS256)
        .compact();
  }

  public boolean validateToken(String token) {
    try {
      getClaims(token);
      return true;
    } catch (JwtException | IllegalArgumentException e) {
      return false;
    }
  }

  public Claims getClaims(String token) {
    return Jwts.parserBuilder()
        .setSigningKey(key)
        .build()
        .parseClaimsJws(token)
        .getBody();
  }
}
