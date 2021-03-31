---
id: version-0.9.3-monitoring
title: Monitoring
sidebar_label: Monitoring
original_id: monitoring
---

IOMesh cluster can be monitored by Prometheus and Grafana.

## Integrating with Prometheus

If Prometheus was installed by [Prometheus Operator][1] at the same Kubernetes cluster with IOMesh, just modify `iomesh-values.yaml` with:

```yaml
serviceMonitor:
  create: true
```

Then upgrade the existing IOMesh Cluster:

> **_NOTE_: You may replace `my-iomesh` with your release name.**

```bash
helm upgrade --namespace iomesh-system my-iomesh iomesh/iomesh --values iomesh-values.yaml
```

The exporter will be created and metric data would be collected by Prometheus automatically.

It is also possible to configure Prometheus mannually by importing [iomesh-prometheus-kubernetes-sd-example.yaml][4].

## Integrating with Grafana

Download and import [iomesh-dashboard.json][3] to any existing Grafana.

[1]: https://github.com/prometheus-operator/prometheus-operator
[2]: https://grafana.com/grafana/download
[3]: http://www.iomesh.com/docs/assets/iomesh-operation/iomesh-dashboard.json
[4]: http://www.iomesh.com/docs/assets/iomesh-operation/iomesh-prometheus-kubernetes-sd-example.yaml
