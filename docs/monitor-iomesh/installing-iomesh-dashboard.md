---
id: installing-iomesh-dashboard
title: Installing IOMesh Dashboard
sidebar_label: Installing IOMesh Dashboard
---

Monitoring IOMesh storage is implemented on the capabilities of Prometheus and Grafana. Before installing IOMesh dashboard, make sure you have installed Prometheus and Grafana.

### Enabling IOMesh Metrics

**Prerequisite**

Verify that Prometheus and Prometheus Operator are already installed [weiqi 加一个链接], and Prometheus is located in the NameSpace `iomesh-system`.

**Procedure**

1. Get `iomesh.yaml` ready. 

    If you previously chose quick or offline installation, run the corresponding command to export `iomesh.yaml`. For custom installation, you already already have `iomesh.yaml` when you manually install IOMesh.  


2. Edit `iomesh.yaml`, including `operator`, `iomesh`, and `blockdevice monitor`.

    `operator`

    ```yaml
    operator:
      metricsPort: 8080

      # Configure ServiceMonitor for Prometheus Operator.
      serviceMonitor: 
        create: true # Create a ServiceMonitor object.
        namespace: "" # Create a NameSpace for ServiceMonitor object, which defaults to iomesh-system.
        labels: {} # Set the label for ServiceMonitor object to filter ServiceMonitor object, which defaults to blank.

        # Configure Relabelings to be applied to samples before scraping. See more information at <https://prometheus.io/docs/prometheus/latest/configuration/configuration/#relabel_config>
        relabelings: [] # Set relabeling parameters for metrics according to needs, which defaults to blank.
      
      # Configure PrometheusRule for Prometheus Operator
      prometheusRule:
        create: true # Create a PrometheusRule object for configuring monitoring rules, which defaults to false.
        namespace: "" # Create a NameSpace for PrometheusRule object, which defaults to iomesh-system.
        labels: {} # Set labels for the PrometheusRule object to select PrometheusRule object, which defaults to blank.
  
      # Configure kube-state-metrics service 
      kubeStateMetrics:
        create: false # Whether you deploy kube-state-metrics service. If it is already deployed, set it to false.
        image:
          registry: registry.k8s.io
          repo: kube-state-metrics/kube-state-metrics
          tag: v2.7.0

        # Configure Relabelings. See more information at <https://prometheus.io/docs/prometheus/latest/configuration/configuration/#relabel_config>
        relabelings: [] # Set relabeling parameters for metrics, which defaults to blank.
    ```

    `iomesh` 

    ```yaml
    iomesh:
      # Configure ServiceMonitor for Prometheus.
      serviceMonitor:
        create: true # Set to true to create a serviceMonitor object. Default value is false.
        namespace: "iomesh-system" # Create a NameSpace for the serviceMonitor object, which defaults to iomesh-system.
        labels: {} # Set the label for the serviceMonitor object, which defaults to blank. 
      meta:
        # Configure Relabelings. See more information at <https://prometheus.io/docs/prometheus/latest/configuration/configuration/#relabel_config>.
        relabelings: [] # Set relabeling parameters for metrics, which defaults to blank.
      chunk:
        # Configure Relabelings. See more information at <https://prometheus.io/docs/prometheus/latest/configuration/configuration/#relabel_config>.  
        relabelings: [] # Set relabeling parameters for metrics, which defaults to blank.
    ```

    `blockdevice monitor`

    ```yaml
    blockdevice-monitor:
      podMonitor:
        create: true # Set to true to create a PodMonitor object. Default value is false.
        namespace: "iomesh-system" # Create a NameSpace for PodMonitor object, which defaults to iomesh-system.
        labels: {} # Set the label for PodMonitor objects, which defaults to blank.
      prometheusRule:
        create: true # Set to true to create a PrometheusRule object. Default value is false.
        namespace: "iomesh-system" # Create a NameSpace for PrometheusRule object, which defaults to iomesh-system.
        labels: {} # Set the label for the PrometheusRule object, which defaults to blank.
      blockdevicemonitor:
        # Configure Relabelings. See more information at <https://prometheus.io/docs/prometheus/latest/configuration/configuration/#relabel_config>. 
        relabelings: [] # Set relabelings parameters, which defaults to blank.
      prober:
        # Configure Relabelings. See more information at <https://prometheus.io/docs/prometheus/latest/configuration/configuration/#relabel_config>. 
        relabelings: [] # Set relabelings parameters, which defaults to blank.
    ```

3. Run the corresponding command to apply modifications according to your installation.


加结果


### Importing Grafana Dashboard

Once you have enabled IOMesh metrics, go to Grafana to import Grafana Dashboard.

**Prerequisite**

You have downloaded `IOMesh-cluster-dashboard.json` file ready. 【weiqi提供一个链接】 

**Procedure**

1. Log in Grafana.

2. In the upper left corner of Dashboard homepage, click **Dashboard** > **+ Import**. 

3. Import `IOMesh-cluster-dashboard.json` file. Once done, you will be able to see IOMesh storage on the dashboard.





