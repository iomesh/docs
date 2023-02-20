---
id: monitoring
title: Monitoring
sidebar_label: Monitoring
---

## Monitoring 

Monitoring IOMesh can be achieved by integrating IOMesh with Prometheus and Grafana.

## Integrating with Prometheus

1. Install Prometheus through Prometheus Operator in the same Kubernetes cluster as IOMesh.

2. If Prometheus was installed by [Prometheus Operator][1] in the same Kubernetes cluster with IOMesh, simply modify `iomesh-values.yaml` (这个文件在哪里找到，是怎么生成的，修改的是啥）with:

```yaml
serviceMonitor:
  create: true
```

3. Run the following command to upgrade the IOMesh cluster.

> **_NOTE_: You may (是一定要改，还是可改可不改，release name 是啥）replace `iomesh` with your release name.**

    ```bash
    helm upgrade --namespace iomesh-system `iomesh` iomesh/iomesh --values iomesh-values.yaml
    ```

    Once done, an exporter will be created and the metric data would be collected by Prometheus automatically.

手动配置和上面的配置有什么区别



It is also possible to configure Prometheus mannually by importing [iomesh-prometheus-kubernetes-sd-example.yaml][4].

## Integrating with Grafana

Download and import [iomesh-dashboard.json][3] to any existing Grafana.

[1]: https://github.com/prometheus-operator/prometheus-operator
[2]: https://grafana.com/grafana/download
[3]: https://raw.githubusercontent.com/iomesh/docs/master/docs/assets/iomesh-operation/ioemsh-dashobard.json
[4]: https://raw.githubusercontent.com/iomesh/docs/master/docs/assets/iomesh-operation/iomesh-prometheus-kubernetes-sd-example.yaml
