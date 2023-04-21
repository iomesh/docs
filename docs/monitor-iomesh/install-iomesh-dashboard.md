---
id: install-iomesh-dashboard
title: Install IOMesh Dashboard
sidebar_label: Install IOMesh Dashboard
---

Monitoring IOMesh storage is implemented on the capabilities of Prometheus and Grafana. Before installing IOMesh dashboard, make sure you have installed Prometheus and Grafana.

## Enable IOMesh Metrics

**Prerequisite**

Verify that [Prometheus and Prometheus Operator](https://github.com/prometheus-operator/prometheus-operator#quickstart) are already installed, and Prometheus is located in the namespace `iomesh-system`.

**Procedure**

1. Run the corresponding command to export `iomesh.yaml`.

<!--DOCUSAURUS_CODE_TABS-->

<!--Quick/Custom-->
```shell
helm -n iomesh-system get values iomesh -o yaml > iomesh.yaml
```
<!--Offline-->
```shell
./helm -n iomesh-system get values iomesh -o yaml > iomesh.yaml
```
<!--END_DOCUSAURUS_CODE_TABS-->


2. In `iomesh.yaml`, configure `operator`, `iomesh`, and `blockdevice monitor`.

    `blockdevice monitor`   
    ```yaml
    blockdevice-monitor:
      # Configure PodMonitor for Prometheus Operator.
      podMonitor:
        create: true # Set it to true to create a PodMonitor object, which defaults to false.
        namespace: "" # Create a namespace for PodMonitor object. If left blank, "iomesh-system" will be specified.
        labels: {} # Set the label for PodMonitor object, which defaults to blank.
      # Configure PrometheusRule for Prometheus Operator.
      prometheusRule:
        create: true # Set it to true to create a PrometheusRule object, which defaults to false.
        namespace: "" # Create a namespace for PrometheusRule object. If left blank, "iomesh-system" will be specified.
        labels: {} # Set the label for PrometheusRule object, which defaults to blank.
   
      blockdevicemonitor:
        podMonitor:
          # Configure Relabelings. See more information at <https://prometheus.io/docs/prometheus/latest/configuration/configuration/#relabel_config>. 
          relabelings: [] # Set relabelings parameters, which defaults to blank.

      prober:
        podMonitor:
          # Configure Relabelings. See more information at <https://prometheus.io/docs/prometheus/latest/configuration/configuration/#relabel_config>. 
          relabelings: [] # Set relabelings parameters, which defaults to blank.
    ```
    `iomesh` 
    ```yaml
    iomesh:
      # Configure ServiceMonitor for Prometheus Operator.
      serviceMonitor:
        create: true # Set it to true to create a serviceMonitor object, which defaults to false.
        namespace: "" # Create a namespace for serviceMonitor object. If left blank, "iomesh-system" will be specified.
        labels: {} # Set the label for serviceMonitor object, which defaults to blank. 

      meta:
        serviceMonitor:
          # Configure Relabelings. See more information at <https://prometheus.io/docs/prometheus/latest/configuration/configuration/#relabel_config>.
          relabelings: [] # Set relabeling parameters for metrics, which defaults to blank.
      chunk:
        serviceMonitor:
          # Configure Relabelings. See more information at <https://prometheus.io/docs/prometheus/latest/configuration/configuration/#relabel_config>.  
          relabelings: [] # Set relabeling parameters for metrics, which defaults to blank.
    ```
    `operator`
    ```yaml
    operator:
      metricsPort: 8080

      # Configure ServiceMonitor for Prometheus Operator.
      serviceMonitor: 
        create: true # Set it to "true" to create a ServiceMonitor object, which defaults to "false".
        namespace: "" # Create a namespace for ServiceMonitor object. If left blank, "iomesh-system" will be specified.
        labels: {} # Set the label for ServiceMonitor object, which defaults to blank.

        # Configure Relabelings. See more information at <https://prometheus.io/docs/prometheus/latest/configuration/configuration/#relabel_config>
        relabelings: [] # Set relabeling parameters for metrics, which defaults to blank.
      
      # Configure PrometheusRule for Prometheus Operator.
      prometheusRule:
        create: true # Set it to "true" to create a PrometheusRule object, which defaults to "false".
        namespace: "" # Create a namespace for PrometheusRule object.  If left blank, "iomesh-system" will be specified.
        labels: {} # Set the label for PrometheusRule object, which defaults to blank.
  
      # Configure kube-state-metrics service.
      kubeStateMetrics:
        create: true # Whether you deploy kube-state-metrics service. If it is already deployed, set it to false.
        image:
          registry: registry.k8s.io
          repo: kube-state-metrics/kube-state-metrics
          tag: v2.7.0

        # Configure Relabelings. See more information at <https://prometheus.io/docs/prometheus/latest/configuration/configuration/#relabel_config>
        relabelings: [] # Set relabeling parameters for metrics, which defaults to blank.
    ```

3. Run the corresponding command to apply configurations according to your installation.

<!--DOCUSAURUS_CODE_TABS-->

<!--Quick/Custom-->
```shell
helm -n iomesh-system upgrade iomesh iomesh/iomesh -f ./iomesh.yaml
```
<!--Offline-->
```shell
./helm -n iomesh-system upgrade iomesh charts/iomesh -f ./iomesh.yaml
```
<!--END_DOCUSAURUS_CODE_TABS-->

4. Verify that your configurations were applied.

    `ServiceMonitor`
    ```bash
    kubectl -n iomesh-system get servicemonitor
    ```

    If successful, you should see output like this:

    ```output
    NAME                 AGE
    iomesh               10m
    iomesh-operator      10m
    kube-state-metrics   10m
    ````
    
    `PodMonitor`

    ```bash
    kubectl -n iomesh-system get podmonitor
    ```
    If successful, you should see output like this:

    ```output
    NAME                         AGE
    blockdevice-monitor          10m
    blockdevice-monitor-prober   10m
    ```
    
    `PrometheusRule`

    ```bash
    kubectl -n iomesh-system get prometheusrule
    ```

    If successful, you should see output like this:
    
    ```output
    NAME                 AGE
    blockdevicemonitor   10m
    iomesh               10m
    ```

    If `kube-state-metrics` service is enabled, verify that it has been installed.

    ```bash
    kubectl -n iomesh-system get pods -l app.kubernetes.io/name=kube-state-metrics
    ```

    If successful, you should see output like this:
    ```output
    NAME                                  READY   STATUS    RESTARTS   AGE
    kube-state-metrics-7bb75797f9-h9r97   1/1     Running   0          10m
    ```

## Import Grafana Dashboard

Once you have enabled IOMesh metrics, go to Grafana to import Grafana Dashboard.

**Prerequisite**

You have downloaded [IOMesh Cluster Dashboard File](https://iomesh.run/dashboard/iomesh-cluster-dashboard.json) .（发布前更新链接）

**Procedure**

1. Log in [Grafana](https://grafana.com/auth/sign-in/?plcmt=top-nav&cta=myaccount).

2. In the upper left corner of Dashboard homepage, click **Dashboard** > **+ Import**. 

3. Import the `IOMesh-cluster-dashboard.json` file. Once done, you will be able to see IOMesh storage on the dashboard.




