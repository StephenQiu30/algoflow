package com.stephen.cloud.gateway.filter;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.client.ServiceInstance;
import org.springframework.cloud.client.loadbalancer.Response;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.web.util.UriComponentsBuilder;
import reactor.core.publisher.Mono;

import java.net.URI;

import static org.springframework.cloud.gateway.support.ServerWebExchangeUtils.*;

/** Routes notification upgrades to the selected instance's Netty listener, not its HTTP port. */
@Component
public class NotificationWebSocketFilter implements GlobalFilter, Ordered {
    @Value("${websocket.port:9090}")
    private int defaultPort;

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        URI uri = exchange.getAttribute(GATEWAY_REQUEST_URL_ATTR);
        if (uri != null && "websocket".equalsIgnoreCase(exchange.getRequest().getHeaders().getUpgrade())
                && exchange.getRequest().getPath().value().startsWith("/api/websocket")) {
            Response<ServiceInstance> response = exchange.getAttribute(GATEWAY_LOADBALANCER_RESPONSE_ATTR);
            String port = response != null && response.hasServer()
                    ? response.getServer().getMetadata().get("websocket-port") : null;
            exchange.getAttributes().put(GATEWAY_REQUEST_URL_ATTR,
                    UriComponentsBuilder.fromUri(uri).scheme("ws").port(port == null ? defaultPort : Integer.parseInt(port))
                            .replacePath("/websocket").build(true).toUri());
        }
        return chain.filter(exchange);
    }

    @Override
    public int getOrder() {
        return 10151; // Immediately after ReactiveLoadBalancerClientFilter.
    }
}
