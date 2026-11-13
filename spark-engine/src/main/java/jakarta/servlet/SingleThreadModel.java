package jakarta.servlet;

/**
 * Compatibility marker interface for Spark 4.0's embedded Jetty 11 running on Jakarta EE 10 (Servlet 6.0+).
 * In Jakarta Servlet 6.0, SingleThreadModel was removed after long deprecation.
 * However, Jetty 11 (used by Spark) still performs an 'instanceof SingleThreadModel' check.
 * Providing this stub satisfies class resolution without altering runtime behavior.
 */
@Deprecated
public interface SingleThreadModel {
}

