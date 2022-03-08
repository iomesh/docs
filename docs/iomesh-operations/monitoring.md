---
id: monitoring
title: Monitoring
sidebar_label: Monitoring
---

IOMesh cluster can be monitored by using Prometheus and Grafana.

## Integrating with Prometheus

If Prometheus was installed by [Prometheus Operator][1] in the same Kubernetes cluster with IOMesh, simply modify `iomesh-values.yaml` with:

```yaml
serviceMonitor:
  create: true
```

Then upgrade the existing IOMesh Cluster:

> **_NOTE_: You may replace `iomesh` with your release name.**

```bash
helm upgrade --namespace iomesh-system iomesh iomesh/iomesh --values iomesh-values.yaml
```

An exporter will be created and the metric data would be collected by Prometheus automatically.

It is also possible to configure Prometheus mannually by importing [iomesh-prometheus-kubernetes-sd-example.yaml][4].

## Integrating with Grafana

Download and import [iomesh-dashboard.json][3] to any existing Grafana.

[1]: https://github.com/prometheus-operator/prometheus-operator
[2]: https://grafana.com/grafana/download
[3]: https://raw.githubusercontent.com/iomesh/docs/master/docs/assets/iomesh-operation/ioemsh-dashobard.json
[4]: https://raw.githubusercontent.com/iomesh/docs/master/docs/assets/iomesh-operation/iomesh-prometheus-kubernetes-sd-example.yaml
