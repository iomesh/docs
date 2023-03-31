---
id: manage-multiple-cluster
title: Multiple Cluster Management
sidebar_label: Multiple Cluster Management
---

In a large-scale Kubernetes cluster, you can deploy multiple IOMesh clusters for data isolation, and each IOMesh cluster is an independent storage pool. In this case, the IOMesh CSI driver enables different IOMesh clusters to communicate, reducing the number of CSI drivers that may consume node resources.

![image](https://user-images.githubusercontent.com/102718816/228175494-9d69fac5-de12-4519-a85f-2520c2070f4c.png)

### Multiple Cluster Deployment

To reduce the number of Pods required in a multi-cluster deployment of IOMesh, the management components shared by all IOMesh clusters, including the IOMesh Operator, IOMesh CSI driver, and Node Disk Manager, will be installed on the first IOMesh cluster, which is referred to as the management cluster.

> _Note:_
> Expanding an IOMesh cluster to two or more clusters is not supported. You should 

**Prerequisites**
- Verify that all requirements in [Prerequisites](https://docs.iomesh.com/deploy-iomesh-cluster/prerequsites.md) are met.
- The IOMesh version should be 1.0.0. 
- A Kubernetes cluster consisting of at least six worker nodes.

**Procedure**

The following section assumes you have 6 worker nodes, deploying the first cluster `iomesh-cluster` on worker nodes `k8s-worker-0`, `k8s-worker-1`, and `k8s-worker-2` and the second cluster `iomesh-cluster-1` on worker nodes `k8s-worker-3`, `k8s-worker-4`, and `k8s-worker-5`. 

#### Deploying First IOMesh Cluster

1. Set up [`open-iscsi`](../docs/deploy-iomesh-cluster/setup-worker-node.md) on each worker node.

2. Export the YAML config `iomesh.yaml`. 

    ```
    helm show values iomesh/iomesh > iomesh.yaml
    ```
3. Configure `iomesh.yaml`.

    - Set the field [`iomesh.chunk.dataCIDR`]((../docs/deploy-iomesh-cluster/prerequisites.md#network-requirments)) to the CIDR you configured for the IOMesh storage network.

        ```yaml
        iomesh:
            chunk:
            dataCIDR: <your-data-cidr-here>
        ```

    - Configure node affinity for fields `iomesh.meta.podPolicy`, `iomesh.chunk.podPolicy`, and `iomesh.redirector.podPolicy` so that they can be scheduled to `k8s-worker-0`, `k8s-worker-1`, and `k8s-worker-2`.


        `iomesh.meta.podPolicy`
        ```yaml
        meta:
              podPolicy:
                affinity:
                  nodeAffinity:
                    requiredDuringSchedulingIgnoredDuringExecution:
                      nodeSelectorTerms:
                      - matchExpressions:
                        - key: kubernetes.io/hostname  # The key of the Kubernetes node label.
                          operator: In
                          values:  # The values of the Kubernetes node label.
                          - k8s-woker-0
                          - k8s-woker-1
                          - k8s-woker-2        
        ```

        `iomesh.chunk.podPolicy`

        ```yaml
        ...
        iomesh:
        ...
            chunk:
            podPolicy:
                affinity:
                nodeAffinity:
                    requiredDuringSchedulingIgnoredDuringExecution:
                    nodeSelectorTerms:
                    - matchExpressions:
                        - key: kubernetes.io/hostname # The key of the Kubernetes node label.
                        operator: In
                        values: # # The values of the Kubernetes node label.
                        - k8s-woker-0
                        - k8s-woker-1
                        - k8s-woker-2
        ```

        `iomesh.redirector.podPolicy`
      ```yaml
      redirector:
            podPolicy:
              affinity:
                nodeAffinity:
                  requiredDuringSchedulingIgnoredDuringExecution:
                    nodeSelectorTerms:
                    - matchExpressions:
                      - key: kubernetes.io/hostname  # The key of the Kubernetes node label.
                        operator: In
                        values:  # The values of the Kubernetes node label.
                        - k8s-woker-0
                        - k8s-woker-1
                        - k8s-woker-2
      ```       


    - Configure `nodeAffinity` to schedule `zookeeper` to `k8s-worker-0`, `k8s-worker-1`, and `k8s-worker-2` and `podAntiAffinity` to ensure each `zookeeper` pod resides on a node, avoiding a single point of failure.  
    
      - Locate `nodeAffinity` and `podAntiAffinity`, you will see the content below:
      ```yaml
      ...
        iomesh:
        ...
            zookeeper:
            podPolicy:
                affinity:
                nodeAffinity:
                podAntiAffinity:
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
                        - key: kubernetes.io/hostname # The key of the Kubernetes node label.
                        operator: In
                        values: # The values of the Kubernetes node label.
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
        ```

4. Perform deployment.

   ```shell
   helm install iomesh iomesh/iomesh --create-namespace  --namespace iomesh-system  --values iomesh.yaml
   ```
  
    If deployment is successful, you should see an output like:
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

#### Deploying Second IOMesh Cluster
1. Create a namespace for the second IOMesh cluster `iomesh-cluster-1`.

    ```
    kubectl create namespace iomesh-cluster-1
    ```

2. Create the `zookeeper` cluster for the cluster `iomesh-cluster-1`. 

    - Create a YAML config `iomesh-cluster-1-zookeeper.yaml` and configure `nodeAffinity` and `podAntiAffinity` so that the `zookeeper` cluster can be scheduled to the worker nodes `k8s-woker-3`, `k8s-woker-4`, and `k8s-woker-5`. 

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
                - key: kubernetes.io/hostname # The key of the Kubernetes node label.
                    operator: In
                    values: # The values of the Kubernetes node label.
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
      `kubectl apply -f iomesh-cluster-1-zookeeper.yaml`
      ```

3. Create `iomesh-cluster-1.yaml` and configure `meta.nodeAffinity`, `chunk.dataCIDR`, `chunk.blockDeviceNamespace`, `chunk.nodeAffinity`, `redirector.dataCIDR`, and `redirector.nodeAffinity`.

    - Mandatory: Fill in `dataCIDR`for `chunk` and `redirector` with the IOMesh storage network segment.
    - Mandatory: Set `spec.chunk.devicemanager.blockDeviceNamespace` to `iomesh-system` as management components are installed in the namespace `iomesh` and all block devices are also in this namespace.
    - Optional. `iomesh-cluster-1.yaml` installs IOMesh Community by default. To set it to Enterprise Edition, set `image.repository.tag` to `v5.3.0-rc13-enterprise` for `meta`, `chunk`, and `redirector` respectively.


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
          tag: v5.3.0-rc13 # To change to Enterprise Edition, set the value to "v5.3.0-rc13-enterprise". 
          pullPolicy: IfNotPresent
        podPolicy:
          affinity:
            nodeAffinity:
              requiredDuringSchedulingIgnoredDuringExecution:
                nodeSelectorTerms:
                - matchExpressions:
            - key: kubernetes.io/hostname  # The key of the Kubernetes node label.
              operator: In
              values:  # The values of the Kubernetes node label.
                    - k8s-woker-3
                    - k8s-woker-4
                    - k8s-woker-5
      chunk:
        dataCIDR: <your-data-cidr-here>  # Fill in IOMesh dataCIDR.
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
          blockDeviceNamespace: iomesh-system  # filled first iomesh cluster namespace here XXXXXXXXXXXXXXXXXX 默认的
        podPolicy:
          affinity:
            nodeAffinity:
              requiredDuringSchedulingIgnoredDuringExecution:
                nodeSelectorTerms:
                - matchExpressions:
            - key: kubernetes.io/hostname  # The key of the Kubernetes node label.
              operator: In
              values:  # The values of the Kubernetes node label.
                    - k8s-woker-3
                    - k8s-woker-4
                    - k8s-woker-5    
      redirector:
        dataCIDR: <your-data-cidr-here>  # # Fill in IOMesh dataCIDR.
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
            - key: kubernetes.io/hostname  # any kubernete node label key
              operator: In
              values:  # kubernete node label key's value
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
#### Mounting Disks

1. [View block devices available for use](https://docs.iomesh.com/deploy/setup-iomesh#block-device-object). Note that all block devices resides in the namespace `iomesh-system`.

    ```shell
    kubectl --namespace iomesh-system -o wide get blockdevice
    ```

2. Refer to [Configuring DeviceMap](https://docs.iomesh.com/deploy-iomesh-cluster/setup-iomesh).

    ```shell
    kubectl edit iomesh -n iomesh-system # The first cluster.
    kubectl edit iomesh-cluster-1 -n iomesh-cluster-1 # The second IOMesh cluster.
    ```

#### Configuring Multiple-Cluster Connection

To enable the IOMesh CSI driver to connect to multiple IOMesh clusters, you need to configure a `ConfigMap` containing connection information for each IOMesh cluster. Before configuration, familarity with `ConfigMap` is suggested.

`ConfigMap`
| Field | Description |
| ----- | ----- |
| `data.clusterId` | The Kubernetes cluster ID, which is customizable. Since a Kubernetes cluster can only have one cluster ID, two iomesh clusters deployed in the same K8s cluster must have the same field ID filled in.|
| `data.iscsiPortal`| iscsi access point, fixed to 127.0.0.1:3260.|
| `data.metaAddr`      | iomesh meta service address, which follows the format: `<iomesh-cluster-name>-meta-client.<iomesh-cluster-namespace>.svc.cluster.local:10100.` |

**Procedure**

1. Create `ConfigMap` for the first IOMesh cluster.

    - Create a YAML config `iomesh-csi-configmap.yaml` with the following content. 

      ```yaml
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
    - Apply the YAML config to generate `ConfigMap`. 

      ```shell
      kubectl apply -f iomesh-csi-configmap.yaml

      ```
2. Create `ConfigMap` for the second IOMesh cluster.

    - Create a YAML config `iomesh-cluster-1-csi-configmap.yaml` with the following content.

      ```
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

    - Apply the YAML config to generate `ConfigMap`.

      ```shell
      kubectl apply -f iomesh-cluster-1-csi-configmap.yaml
      ```




#### Creating StorageClass for Each Cluster

When deploying more than one IOMesh cluster, you must create a separate StorageClass for each cluster, rather than using the default StorageClass `iomesh-csi-driver`. For details, refer to the following and [Creating Custom StorageClass](https://docs.iomesh.com/deploy-iomesh-cluster/setup-iomesh). 

|Field| Description|
|---|---|
| `parameters.clusterConnection` |The namespace you specify in `configMap` and the `configMap` name.|
| `parameters.iomeshCluster`| The namespace where the IOMesh cluster is located/the IOMesh cluster name.                              |

**Procedure**

1. Create a StorageClass for the first IOMesh cluster.

      ```yaml
      apiVersion: storage.k8s.io/v1
      kind: StorageClass
      metadata:
        name: iomesh
      parameters:
        csi.storage.k8s.io/fstype: "ex4" 
        replicaFactor: "2" # 
        thinProvision: "true"
        reclaimPolicy: Delete
        clusterConnection: "iomesh-system/iomesh-csi-configmap"  # Specify the namespace and configMap of the first IOMesh cluster.
        iomeshCluster: "iomesh-system/iomesh"
      volumeBindingMode: Immediate
      provisioner: com.iomesh.csi-driver
      allowVolumeExpansion: true
      ```
      ```shell
      kubectl apply -f <yaml.filename>
      ```

2. Create a StorageClass for the second IOMesh cluster.

    ```yaml
    apiVersion: storage.k8s.io/v1
    kind: StorageClass
    metadata:
      name: iomesh-cluster-1
    parameters:
      csi.storage.k8s.io/fstype: ext4
      replicaFactor: "2"
      thinProvision: "true"
      reclaimPolicy: Delete
      clusterConnection: "iomesh-cluster-1/iomesh-cluster-1-csi-configmap"  # Specify the namespace and configMap for the second IOMesh cluster.
      iomeshCluster: "iomesh-cluster-1/iomesh-cluster-1" # Specify the namespace where this IOMesh cluster resides and cluster name.
    volumeBindingMode: Immediate
    provisioner: com.iomesh.csi-driver
    allowVolumeExpansion: true
    ```
      ```shell
      kubectl apply -f <yaml.filename> 
      ```

#### Verifying Deployment 

To verify if the IOMesh clusters are deployed, create a PVC using the StorageClass you created respectively. 

1. Create a PVC for the first IOMesh cluster.

    ```yaml
    kind: PersistentVolumeClaim
    apiVersion: v1
    kind: PersistentVolumeClaim
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
    kubectl apply -f <yaml.filename>
    ```

2.Create a PVC for the second IOMesh cluster. 

      ```yaml
      kind: PersistentVolumeClaim
      apiVersion: v1
      kind: PersistentVolumeClaim
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
    kubectl apply -f <yaml.filename>
    ```


IOMesh enables typology awareness function by default to ensure pods are properly scheduled. If you create a PVC in the first IOMesh cluster, the pod using this PVC will be scheduled to the worker node where the first IOMesh cluster is located, ensuring I/O localization of this pod.

### Multiple Cluster Operations

All procedures below are listed based on the example in [Multiple Cluster Deployment](https://docs.iomesh.com/advanced-functions/multiple-cluster-management.md).

#### Upgrading Multiple Clusters

When upgrading multiple IOMesh clusters, it is recommended to first upgrade the management cluster and then other clusters. If you choose a cluster not the management cluster, the cluster will be temporarily unavailable when upgrading the second cluster; however all clusters will be back to normal finally.

**Procedure**

1. Refer to [Upgrading Cluster](iomesh-operations/cluster-operations.md) to upgrade the first IOMesh cluster, which is the management cluster.

2. After the first upgrade is complete, run the following command to edit the second IOMesh cluster, 

    第一套 IOMesh 集群升级完毕后，使用 `kubectl edit iomesh iomesh-cluster-1 -n iomesh-cluster-1` 编辑第二套 IOMesh 集群，修改所有的 yaml 配置中的 `spec.*.image.tags`  字段与第一套 IOMesh 集群保持一致(第一套 IOMesh 集群的配置通过 `kubectl get iomesh iomesh -n iomesh-system -o yaml` 命令查看)

#### Scaling Multiple Clusters

There is no difference between scaling up one cluster and scaling up multiple cluster operations. Plan the number of worker nodes and increase the number of meta or chunk pods one cluster by one cluster. For more information, see [Scaling IOMesh Cluster](https://docs.iomesh.com/cluster-operations/scaling-cluster.md).

#### Uninstalling Multiple Clusters

When uninstalling more than one IOMesh cluster, uninstall the other clusters first and then the management cluster last. If you do not follow the order, there may be resources resided in the namespace `iomesh-system`, which may affect next deployment in this namespace.

**Procedure**
1. Uninstall the second IOMesh cluster, which will also delete `iomesh` and `zookeeper` components. 

   If you have two more clusters, repeat the step to 再多几个集群咋删了,

    ```shell
    kubectl delete -f iomesh-cluster-1-zookeeper.yaml && kubectl delete -f iomesh-cluster-1.yaml
    ```

2. Refer to [Uninstalling IOMesh Cluster](https://docs.iomesh.com/cluster-operations/uninstall-cluster.md) to uninstall the first cluster.
    ```shell
    helm uninstall --namespace iomesh-system iomesh
    ```

#### License Management

Each IOMesh cluster has a license with a unique serial number. You need to [activate the license](https://www.iomesh.com/license) for each IOMesh cluster respectively. For other operations, refer to [Updating ]