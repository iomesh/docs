---
id: manage-multiple-cluster
title: Multiple Cluster Management
sidebar_label: Multiple Cluster Management
hide_title: true
---
# Multiple Cluster Management

In a large-scale Kubernetes cluster, you can deploy multiple IOMesh clusters for data isolation. In this case, there is typically one management cluster that holds components such as the IOMesh Operator, IOMesh CSI Driver, and Node Disk Manager, while other clusters function as independent storage pools without any management responsibilities. 

IOMesh CSI Driver is shared by all IOMesh clusters to facilitate connection, which reduces the number of Controller Plugin pods for the CSI driver.

![image](https://user-images.githubusercontent.com/102718816/228175494-9d69fac5-de12-4519-a85f-2520c2070f4c.png)

## Deployment

**Prerequisites**
- Verify that all requirements in [Prerequisites](../deploy-iomesh-cluster/prerequisites.md) are met.
- The IOMesh version should be 1.0.0 or above. 
- A Kubernetes cluster consisting of at least 6 worker nodes.
- Verify that [`open-iscsi`](../deploy-iomesh-cluster/setup-worker-node) has been set up for each worker node.

**Procedure**

The following example assumes a total of 6 worker nodes `k8s-worker-{0-5}`. `iomesh` is the management cluster and `iomesh-cluster-1` is the non-management cluster.

|Cluster Name|Role|Worker Nodes|Namespace|
|---|---|---|---|
|`iomesh`|Management cluster| k8s-woker-{0~2} |`iomesh-system`|
|`iomesh-cluster-1`| Independent storage pool|k8s-woker-{3~5}|` iomesh-cluster-1`| 

>_NOTE_: Both custom and offline installation are suitable for deploying multiple clusters. For [online custom installation](../deploy-iomesh-cluster/install-iomesh#custom-installation), install `Helm` and add the IOMesh Helm repository. For [offline installation](../deploy-iomesh-cluster/install-iomesh#offline-installation), download the installation package and load the IOMesh image.

### Deploy Management Cluster

1. Export the YAML config `iomesh.yaml`. 

    ```
    helm show values iomesh/iomesh > iomesh.yaml
    ```
2. Configure `iomesh.yaml`.

    - Set `iomesh.chunk.dataCIDR`, `diskDeploymentMode`, and `edition`. See configuration details in [Install IOMesh](../deploy-iomesh-cluster/install-iomesh).

    - Configure `nodeAffinity` for fields `iomesh.meta.podPolicy`, `iomesh.chunk.podPolicy`, and `iomesh.redirector.podPolicy` respectively so that they can be scheduled to nodes `k8s-woker-{0~2}`.
  
      ```yaml
      iomesh:
        chunk:
          podPolicy:
            affinity:
              nodeAffinity:
                requiredDuringSchedulingIgnoredDuringExecution:
                  nodeSelectorTerms:
                  - matchExpressions:
                    - key: kubernetes.io/hostname  # The key of the node label.
                      operator: In
                      values:  # The value of the node label.
                      - k8s-woker-0
                      - k8s-woker-1
                      - k8s-woker-2
        meta:
          podPolicy:
            affinity:
              nodeAffinity:
                requiredDuringSchedulingIgnoredDuringExecution:
                  nodeSelectorTerms:
                  - matchExpressions:
                    - key: kubernetes.io/hostname  # The key of the node label.
                      operator: In
                      values:  # The value of the node label.
                      - k8s-woker-0
                      - k8s-woker-1
                      - k8s-woker-2
        redirector:
          podPolicy:
            affinity:
              nodeAffinity:
                requiredDuringSchedulingIgnoredDuringExecution:
                  nodeSelectorTerms:
                  - matchExpressions:
                    - key: kubernetes.io/hostname  # The key of the node label.
                      operator: In
                      values:  # The value of the node label.
                      - k8s-woker-0
                      - k8s-woker-1
                      - k8s-woker-2
      ```

    - Configure `nodeAffinity` and `podAntiAffinity` for `iomesh.zookeeper`. The former will schedule `zookeeper` to nodes `k8s-woker-{0~2}`, while the latter ensures that each node has a `zookeeper` pod to avoid a single point of failure.
    
      - Locate `iomesh.zookeeper.podPolicy`, you should see the content below:
      ```yaml
      ...
      iomesh:
      ...
        zookeeper:
          podPolicy:
            affinity:
      ```    
      - Copy and paste the following sample code and configure `key` and `values`.

        ```yaml
        ...
        iomesh:
        ...
          zookeeper:
            podPolicy:
              affinity:
                nodeAffinity:
                  requiredDuringSchedulingIgnoredDuringExecution:
                    nodeSelectorTerms:
                    - matchExpressions:
                      - key: kubernetes.io/hostname  # The key of the node label.
                        operator: In
                        values:  # The value of the node label.
                        - k8s-woker-0
                        - k8s-woker-1
                        - k8s-woker-2
                podAntiAffinity:
                  preferredDuringSchedulingIgnoredDuringExecution:
                  - podAffinityTerm:
                      labelSelector:
                        matchExpressions:
                        - key: app
                          operator: In
                          values:
                          - iomesh-zookeeper
                      topologyKey: kubernetes.io/hostname
                    weight: 20

3. Perform deployment. If all pods are shown in `Running` state, then IOMesh has been installed successfully. 
   
   Note that the CSI pods on node `k8s-woker-{3~5}` are in `Crash` state at this time and will only transition to `Running` state after the second IOMesh cluster is deployed.

   ```shell
   helm install iomesh iomesh/iomesh --create-namespace  --namespace iomesh-system  --values iomesh.yaml
   ```
  
    If successful, you should see output below:
   ```output
   NAME                                                  READY   STATUS    RESTARTS   AGE
   iomesh-blockdevice-monitor-766655959f-7bwvv           1/1     Running   0          5h37m
   iomesh-blockdevice-monitor-prober-pgbcp               1/1     Running   0          5h36m
   iomesh-blockdevice-monitor-prober-v848k               1/1     Running   0          5h37m
   iomesh-blockdevice-monitor-prober-w6vrw               1/1     Running   0          5h36m
   iomesh-chunk-0                                        3/3     Running   0          5h34m
   iomesh-chunk-1                                        3/3     Running   0          5h33m
   iomesh-chunk-2                                        3/3     Running   0          5h33m
   iomesh-csi-driver-controller-plugin-ccf6ccfd9-kf296   6/6     Running   3          30h
   iomesh-csi-driver-node-plugin-c8mrj                   3/3     Running   1          30h
   iomesh-csi-driver-node-plugin-jncfr                   3/3     Running   1          30h
   iomesh-csi-driver-node-plugin-qrvc6                   3/3     Running   1          30h
   iomesh-hostpath-provisioner-vdmrz                     1/1     Running   0          31h
   iomesh-hostpath-provisioner-wtbfh                     1/1     Running   0          31h
   iomesh-hostpath-provisioner-xlkvb                     1/1     Running   0          31h
   iomesh-iscsi-redirector-9c455                         2/2     Running   1          5h36m
   iomesh-iscsi-redirector-k7jbx                         2/2     Running   3          5h35m
   iomesh-iscsi-redirector-l9w7l                         2/2     Running   1          5h34m
   iomesh-localpv-manager-82564                          4/4     Running   2          29h
   iomesh-localpv-manager-pkcbd                          4/4     Running   0          12h
   iomesh-localpv-manager-px4cl                          4/4     Running   0          29h
   iomesh-meta-0                                         2/2     Running   0          5h34m
   iomesh-meta-1                                         2/2     Running   0          5h35m
   iomesh-meta-2                                         2/2     Running   0          5h34m
   iomesh-openebs-ndm-cluster-exporter-68c757948-qmtt4   1/1     Running   0          31h
   iomesh-openebs-ndm-gnkzt                              1/1     Running   0          31h
   iomesh-openebs-ndm-lrww8                              1/1     Running   0          31h
   iomesh-openebs-ndm-node-exporter-rp4qr                1/1     Running   0          31h
   iomesh-openebs-ndm-node-exporter-sgzpp                1/1     Running   0          31h
   iomesh-openebs-ndm-node-exporter-txbn5                1/1     Running   0          31h
   iomesh-openebs-ndm-operator-584fdbcb94-2tjsp          1/1     Running   0          31h
   iomesh-openebs-ndm-zdngg                              1/1     Running   0          31h
   iomesh-zookeeper-0                                    1/1     Running   0          31h
   iomesh-zookeeper-operator-64957fcc4f-zpdjp            1/1     Running   0          30h
   operator-f5644b7f9-2vvw7                              1/1     Running   0          5h37m
   ```

### Deploy Non-Management Cluster

1. Create a namespace for the cluster `iomesh-cluster-1`. 

    ```
    kubectl create namespace iomesh-cluster-1
    ```

2. Create a `zookeeper` cluster for the cluster `iomesh-cluster-1`. 

    - Create a YAML config `iomesh-cluster-1-zookeeper.yaml` with the following content. Then configure `nodeAffinity` and `podAntiAffinity` so that the `zookeeper` cluster will be scheduled to nodes `k8s-woker-{3~5}`. 
  
      ```yaml
      apiVersion: zookeeper.pravega.io/v1beta1
      kind: ZookeeperCluster
      metadata:
        namespace: iomesh-cluster-1
        name: iomesh-cluster-1-zookeeper
      spec:
        replicas: 3
        image:
          repository: iomesh/zookeeper
          tag: 3.5.9
          pullPolicy: IfNotPresent
        pod:
          affinity:
            nodeAffinity:
              requiredDuringSchedulingIgnoredDuringExecution:
                nodeSelectorTerms:
                - matchExpressions:
                  - key: kubernetes.io/hostname  # The key of the node label.
                    operator: In
                    values:  # The value of the node label.
                    - k8s-woker-3
                    - k8s-woker-4
                    - k8s-woker-5
            podAntiAffinity:
              preferredDuringSchedulingIgnoredDuringExecution:
              - podAffinityTerm:
                  labelSelector:
                    matchExpressions:
                    - key: app
                      operator: In
                      values:
                      - iomesh-cluster-1-zookeeper
                  topologyKey: kubernetes.io/hostname
                weight: 20
          securityContext:
            runAsUser: 0
        persistence:
          reclaimPolicy: Delete
          spec:
            storageClassName: hostpath
            resources:
              requests:
                storage: 20Gi
      ```

    - Apply the YAMl config to create the `zookeeper` cluster.
      ```shell
      kubectl apply -f iomesh-cluster-1-zookeeper.yaml
      ```

3. Create the YAML config `iomesh-cluster-1.yaml` with the following content. Configure the following fields.

    - Set `dataCIDR` to the data CIDR you previously configured in [Prerequisites](../deploy-iomesh-cluster/prerequisites#network-requirements) for `chunk` and `redirector`, respectively.
    - Set `spec.chunk.devicemanager.blockDeviceNamespace` to `iomesh-system` as management components and all block devices reside in it.
    - Set `image.repository.tag` to `v5.3.0-rc13-enterprise` for `meta`, `chunk`, and `redirector`, respectively for an Enterprise edition. If not, a community edition will be automatically installed.
    - Set [`diskDeploymentMode`](../deploy-iomesh-cluster/prerequisites#hardware-requirements) according to your disk configurations.

      ```yaml
      apiVersion: iomesh.com/v1alpha1
      kind: IOMeshCluster
      metadata:
        namespace: iomesh-cluster-1
        name: iomesh-cluster-1
      spec:
        diskDeploymentMode: hybridFlash
        storageClass: hostpath
        reclaimPolicy:
          volume: Delete
          blockdevice: Delete
        meta:
          replicas: 3
          image:
            repository: iomesh/zbs-metad
            tag: v5.3.0-rc13 # For an enterprise Edition, set it to "v5.3.0-rc13-enterprise". 
            pullPolicy: IfNotPresent
          podPolicy:
            affinity:
              nodeAffinity:
                requiredDuringSchedulingIgnoredDuringExecution:
                  nodeSelectorTerms:
                  - matchExpressions:
                    - key: kubernetes.io/hostname  # The key of the node label.
                      operator: In
                      values:  # The value of the node label.
                      - k8s-woker-3
                      - k8s-woker-4
                      - k8s-woker-5
        chunk:
          dataCIDR: <your-data-cidr-here>  # Fill in IOMesh data CIDR.
          replicas: 3
          image:
            repository: iomesh/zbs-chunkd
            tag: v5.3.0-rc13
            pullPolicy: IfNotPresent
          devicemanager:
            image:
              repository: iomesh/operator-devicemanager
              tag: v1.0.0
              pullPolicy: IfNotPresent
            blockDeviceNamespace: iomesh-system  # Fill in the namespace of the management cluster.
          podPolicy:
            affinity:
              nodeAffinity:
                requiredDuringSchedulingIgnoredDuringExecution:
                  nodeSelectorTerms:
                  - matchExpressions:
                    - key: kubernetes.io/hostname  # The key of the node label.
                      operator: In
                      values:  # The value of the node label.
                      - k8s-woker-3
                      - k8s-woker-4
                      - k8s-woker-5    
        redirector:
          dataCIDR: <your-data-cidr-here>  # Fill in IOMesh data CIDR.
          image:
            repository: iomesh/zbs-iscsi-redirectord
            tag: v5.3.0-rc13
            pullPolicy: IfNotPresent
          podPolicy:
            affinity:
              nodeAffinity:
                requiredDuringSchedulingIgnoredDuringExecution:
                  nodeSelectorTerms:
                  - matchExpressions:
                    - key: kubernetes.io/hostname  # The key of the node label.
                      operator: In
                      values:  # The value of the node label.
                      - k8s-woker-3
                      - k8s-woker-4
                      - k8s-woker-5
        probe:
          image:
            repository: iomesh/operator-probe
            tag: v1.0.0
            pullPolicy: IfNotPresent
        toolbox:
          image:
            repository: iomesh/operator-toolbox
            tag: v1.0.0
            pullPolicy: IfNotPresent
      ```
    
    - Apply the YAML config.
      ```shell
      kubectl apply -f iomesh-cluster-1.yaml -n iomesh-cluster-1
      ```
### Mount Disks

1. [View block device objects](../deploy-iomesh-cluster/setup-iomesh). Note that all block devices resides in the namespace `iomesh-system`.

    ```shell
    kubectl --namespace iomesh-system -o wide get blockdevice
    ```

2. [Configure DeviceMap](../deploy-iomesh-cluster/setup-iomesh).

    ```shell
    kubectl edit iomesh iomesh -n iomesh-system # Configure deviceMap for the first IOMesh cluster.
    kubectl edit iomesh iomesh-cluster-1 -n iomesh-cluster-1 # Configure deviceMap for the second IOMesh cluster.
    ```
### Configure Multi-Cluster Connection

To enable IOMesh CSI Driver to connect to multiple IOMesh clusters, you need to create a `ConfigMap` containing connection information for each IOMesh cluster. 

**Procedure**

1. Create a `ConfigMap` for the first IOMesh cluster.
    ```yaml
    # Source: iomesh-csi-configmap.yaml
    apiVersion: v1
    kind: ConfigMap
    metadata:
      name: iomesh-csi-configmap
      namespace: iomesh-system
    data:
      clusterId: k8s-cluster
      iscsiPortal: 127.0.0.1:3260
      metaAddr: iomesh-meta-client.iomesh-system.svc.cluster.local:10100
    ```
    ```shell
    kubectl apply -f iomesh-csi-configmap.yaml
    ```
    | Field | Description |
    | ----- | ----- |
    | `data.clusterId` | The Kubernetes cluster ID, which is customizable. Since a Kubernetes cluster can only have one cluster ID, two iomesh clusters deployed in the same Kubernetes cluster must have the same field value filled in.|
    | `data.iscsiPortal`| iSCSI access point, fixed to 127.0.0.1:3260.|
    | `data.metaAddr`      | IOMesh meta service address, which follows the format: `<iomesh-cluster-name>-meta-client.<iomesh-cluster-namespace>.svc.cluster.local:10100.` |

2. Create a `ConfigMap` for the second IOMesh cluster.
    ```yaml
    # Source: iomesh-cluster-1-csi-configmap.yaml
    apiVersion: v1
    kind: ConfigMap
    metadata:
      name: iomesh-cluster-1-csi-configmap
      namespace: iomesh-cluster-1
    data:
      clusterId: k8s-cluster
      iscsiPortal: 127.0.0.1:3260
      metaAddr: iomesh-cluster-1-meta-client.iomesh-cluster-1.svc.cluster.local:10100
    ```
    ```shell
    kubectl apply -f iomesh-cluster-1-csi-configmap.yaml
    ```

### Create StorageClass for Each Cluster

When deploying more than one IOMesh cluster, you must create a separate StorageClass for each cluster, rather than using the default StorageClass `iomesh-csi-driver`. 

**Procedure**

1. Create a StorageClass for the first IOMesh cluster.
    ```yaml
    # Source: iomesh-sc.yaml
    apiVersion: storage.k8s.io/v1
    kind: StorageClass
    metadata:
      name: iomesh
    parameters:
      csi.storage.k8s.io/fstype: ext4
      replicaFactor: "2"
      thinProvision: "true"
      reclaimPolicy: Delete
      clusterConnection: "iomesh-system/iomesh-csi-configmap" # The namespace and configMap of the management cluster.
      iomeshCluster: "iomesh-system/iomesh" # The namespace where this cluster resides and cluster name.
    volumeBindingMode: Immediate
    provisioner: com.iomesh.csi-driver
    allowVolumeExpansion: true
    ```
    ```shell
    kubectl apply -f iomesh-sc.yaml
    ```
    |Field| Description|
    |---|---|
    | `parameters.clusterConnection` |The namespace you specify in `configMap`/the `configMap` name.|
    | `parameters.iomeshCluster`| The namespace where the IOMesh cluster is located/the IOMesh cluster name.  |
    For more information, refer to [Create StorageClass](../volume-operations/create-storageclass).

2. Create a StorageClass for the second IOMesh cluster.
    ```yaml 
    # Source: iomesh-cluster-1-sc.yaml
    apiVersion: storage.k8s.io/v1
    kind: StorageClass
    metadata:
      name: iomesh-cluster-1
    parameters:
      csi.storage.k8s.io/fstype: ext4
      replicaFactor: "2"
      thinProvision: "true"
      reclaimPolicy: Delete
      clusterConnection: "iomesh-cluster-1/iomesh-cluster-1-csi-configmap"  # The namespace and configMap of the non-management cluster.
      iomeshCluster: "iomesh-cluster-1/iomesh-cluster-1" # The namespace of the non-management cluster and its cluster name.
    volumeBindingMode: Immediate
    provisioner: com.iomesh.csi-driver
    allowVolumeExpansion: true
    ```
    ```shell
    kubectl apply -f iomesh-cluster-1-sc.yaml
    ```

### Verify Deployment 

To verify if the IOMesh clusters are deployed, create a PVC using the StorageClass you created respectively. 

1. Create a PVC for the first IOMesh cluster.
    ```yaml
    # Source: iomesh-pvc.yaml
    kind: PersistentVolumeClaim
    apiVersion: v1
    metadata:
      name: iomesh-pvc
    spec:
      storageClassName: iomesh
      accessModes:
        - ReadWriteOnce
      resources:
        requests:
          storage: 1Gi
    ```
    ```shell
    kubectl apply -f iomesh-pvc.yaml
    ```

2. Create a PVC for the second IOMesh cluster. 
    ```yaml
    # Source: iomesh-cluster1-pvc.yaml
    kind: PersistentVolumeClaim
    apiVersion: v1
    metadata:
      name: iomesh-cluster1-pvc
    spec:
      storageClassName: iomesh-cluster-1
      accessModes:
        - ReadWriteOnce
      resources:
        requests:
          storage: 1Gi
    ```                                             
    ```shell
    kubectl apply -f iomesh-cluster1-pvc.yaml
    ```

Topology awareness is automatically enabled for IOMesh to ensure correct pod scheduling. When a PVC is created in the first IOMesh cluster, the pod using it is scheduled to the worker node in the same cluster.

## Monitoring

To monitor multiple IOMesh clusters, navigate to [Install IOMesh Dashboard](../monitor-iomesh/install-iomesh-dashboard.md) for monitoring configuration. After completing the configuration, you can select the target cluster and its namespace to view its storage performance on the dashboard.

## Operations 

All of the following procedures are based on the example in [Deployment](../advanced-functions/manage-multiple-cluster.md#deployment).

### Scaling Multiple Clusters

There is no difference between scaling up one cluster or multiple clusters. Plan the number of worker nodes and increase the number of meta or chunk pods one by one. For more information, see [Scale Cluster](../cluster-operations/scale-cluster).

### Uninstall Multiple Clusters

When uninstalling more than one IOMesh clusters, follow the order: first non-management clusters, then the management cluster. If not, resources may reside in the namespace `iomesh-system`, affecting the next deployment of IOMesh.

**Procedure**
1. Uninstall the second IOMesh cluster, which will also delete `iomesh` and `zookeeper` components in it. 

    Replace `iomesh-cluster-1-zookeeper.yaml` with its zookeeper YAML filename and `iomesh-cluster-1.yaml` with its YAML filename. Run the following two commands at the same time.

    ```shell
    kubectl delete -f iomesh-cluster-1-zookeeper.yaml 
    kubectl delete -f iomesh-cluster-1.yaml
    ```

2. [Uninstall the management cluster](../cluster-operations/uninstall-cluster).
    ```shell
    helm uninstall --namespace iomesh-system iomesh
    ```

### Update License

Each IOMesh cluster has a license with a unique serial number, and update the license from `Trial` to `Subscription` or `Perpetual` for each IOMesh cluster respectively after deployment. For other operations, refer to [Update License](../cluster-operations/manage-license).