---
id: enabling-iomesh-metrics
title: Enabling IOMesh Metrics
sidebar_label: Enabling IOMesh Metrics
---

## Enabling Metrics for IOMesh

Monitoring IOMesh storage is implemented on the monitoring capabilities of Prometheus. So make sure you have installed Prometheus and Prometheus Operator, and Prometheus is installed in the IOMesh system NameSpace.

**Prerequisite**

Verify that Prometheus and Prometheus Operator are installed, and Prometheus is located in the IOMesh system NameSpace.

**Procedure**

1. Get `iomesh.yaml`. 

   If you choose quick installation, run the following command to export `iomesh.yaml`. If you manually install IOMesh, you can get `iomesh.yaml` obtained at that process.

   ```
   helm -n iomesh-system get values iomesh -o yaml > iomesh.yaml
   ```

2. Edit `iomesh.yaml`, including `operator`, `iomesh`, and `blockdevice monitor`.

`operator`

```yaml
operator:
  metricsPort: 8080

  # Configure ServiceMonitor for Prometheus Operator
  serviceMonitor: 
    create: true # Create a ServiceMonitor object.
    namespace: "" # Create a NameSpace for ServiceMonitor object, which defaults to iomesh-system.
    labels: # Set label for ServiceMonitor object，which helps the user to filter ServiceMonitor object. 默认为空

    # RelabelConfigs to apply to samples before scraping.
    # More info: <https://prometheus.io/docs/prometheus/latest/configuration/configuration/#relabel_config>
    relabelings: [] # Set Relabeling paramters for metrics according to needs, which defaults to blank.
  
  # Configure PrometheusRule for Prometheus Operator
  prometheusRule:
    create: true # 创建 PrometheusRule 对象，用于设置监控规则
    namespace: "" # 创建 SerivceMonitor 对象的命名空间，默认为 iomesh-system
    labels: # 设置 ServiceMonitor 对象的 Label，用于 Prometheus 对象的 spec.ruleSelector，默认为空

  # kube-state-metrics config
  kubeStateMetrics:
    create: true # 是否启用 kube-state-metrics 服务，如果集群中已经部署，这里可以设置为 false，默认为 false. 如果 k8s 集群已经安装了这个服务，这一步可以设置为 false
    image:
      registry: registry.k8s.io
      repo: kube-state-metrics/kube-state-metrics
      tag: v2.7.0

    # RelabelConfigs to apply to samples before scraping. 刮取的过程中可以替换 label(解释下面的 relabeling 这个动作)
    # More info: <https://prometheus.io/docs/prometheus/latest/configuration/configuration/#relabel_config>
    relabelings: [] # 按需设置 metrics 的 Relabling 参数，默认为空
```

`iomesh` 

```yaml
iomesh:
  # ServiceMonitor config for Prometheus
  serviceMonitor:
    create: true # 创建 ServiceMonitor 对象
    namespace: "" # 创建 SerivceMonitor 对象的命名空间，默认为 iomesh-system
    labels: # 设置 ServiceMonitor 对象的 Label，用于 Prometheus 对象的 spec.serviceMonitorSelector，默认为空
  meta:
    # RelabelConfigs to apply to samples before scraping.
    # More info: <https://prometheus.io/docs/prometheus/latest/configuration/configuration/#relabel_config>
    relabelings: [] # 按需设置 metrics 的 Relabling 参数，默认为空
  chunk:
    # RelabelConfigs to apply to samples before scraping.
    # More info: <https://prometheus.io/docs/prometheus/latest/configuration/configuration/#relabel_config>    
    relabelings: [] # 按需设置 metrics 的 Relabling 参数，默认为空
```

`blockdevice monitor`

```yaml
blockdevice-monitor:
  prometheusRule:
    create: true # 创建 PrometheusRule 对象 
    namespace: "monitoring" # 创建 PrometheusRule 对象的命名空间，默认为 iomesh-system
    labels: # 设置 PrometheusRule 对象的 Label，用于 Prometheus 对象的 spec.ruleSelector，默认为空
      app: iomesh
  podMonitor:
    create: true # 创建 PodMonitor 对象
    namespace: "monitoring" # 创建 PodMonitor 对象的命名空间，默认为 iomesh-system
    labels: # 设置 PodMonitor 对象的 Label，用于 Prometheus 对象的 spec.serviceMonitorSelector，默认为空
      app: iomesh
  blockdevicemonitor:
    # RelabelConfigs to apply to samples before scraping.
    # More info: <https://prometheus.io/docs/prometheus/latest/configuration/configuration/#relabel_config>
    relabelings: [] # 按需设置 metrics 的 Relabling 参数，默认为空
  prober:
    # RelabelConfigs to apply to samples before scraping.
    # More info: <https://prometheus.io/docs/prometheus/latest/configuration/configuration/#relabel_config>
    relabelings: [] # 按需设置 metrics 的 Relabling 参数，默认为空
```

3. Run the following command to apply your modifications.

    ```bash
    helm -n iomesh-system upgrade iomesh iomesh/iomesh -f ./iomesh.yaml
    ```


 



