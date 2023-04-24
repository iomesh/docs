---
id: external-storage
title: IOMesh as External Storage 
sidebar_label: IOMesh as External Storage 
---

In addition to providing storage within its Kubernetes environment where IOMesh is located, IOMesh can also offer storage externally to a Kubernetes cluster through CSI, or function as an iSCSI target for an iSCSI client.

## Configure iSCSI Access Point

To use IOMesh storage via the CSI driver or iSCSI target, it is necessary to configure an iSCSI access point first.

To ensure that the access point has a consistent and functional IP address, IOMesh employs `iomesh-access` service with a service type of `LoadBalancer`. This service must have an IP externally exposed, and the specific method for configuring this external IP will vary depending on the cloud environment in which IOMesh is deployed.

- For IOMesh deployed in [LoadBalancer-supported cloud environments](https://kubernetes.io/docs/concepts/services-networking/service/#internal-load-balancer), see `In-Tree LoadBalancer`.
- For IOMesh deployed on bare metal or other LoadBalancer-not-supported cloud environments, see `Out-of-Tree LoadBalancer`.

<!--DOCUSAURUS_CODE_TABS-->

<!--In-Tree LoadBalancer-->

  If IOMesh is deployed in a cloud environment that supports `LoadBalancer`, Kubernetes will automatically call the API of the cloud provider and assign an external IP to `iomesh-access` service.

1. Check the status of `iomesh-access` service, ensuring it has been assigned an external IP.

    ```bash
    kubectl get service iomesh-access -n iomesh-system
    ```
    ```output
    NAME            TYPE           CLUSTER-IP     EXTERNAL-IP     PORT(S)                                                          AGE
    iomesh-access   LoadBalancer   10.96.22.212   192.168.2.1     3260:32012/TCP,10206:31920/TCP,10201:31402/TCP,10207:31802/TCP   45h

2. Set `spec.redirector.iscsiVirtualIP` to the external IP of `iomesh-access` service by running the following command. Once edited, the `iomesh-iscsi-redirector` pod will automatically restart to make the modification take effect. 
    ```bash
    kubectl edit iomesh iomesh -n iomesh-system
    ```

    > _NOTE_: `spec.redirector.iscsiVirtualIP` must be the same as the external IP. If the external IP is changed, update `spec.redirector.iscsiVirtualIP`.

3. An optional step. To use storage from one more IOMesh cluster, run the `kubectl edit` command to set the `spec.redirector.iscsiVirtualIP` field in its YAML file to the external IP of the `iomesh-access` service.

<!--Out-of-Tree LoadBalancer-->
In case IOMesh is deployed on bare metal or any cloud environment that does not support Kubernetes `LoadBalancer`, you will need to install `MetallLB` as the default `LocalBalancer` in the Kubernetes cluster.

1. Verify that the Kubernetes cluster meets [the `MetalLB` installation requirements](https://metallb.universe.tf/installation/#preparation).

2. Install `MetalLB`.
    ```shell
    helm repo add metallb https://metallb.github.io/metallb
    helm install metallb metallb/metallb --version 0.12.1 -n iomesh-system
    ```
3. Create a `MetalLB` YAML configMap `metallb-config.yaml`. 

    Set `protocol` to `layer2`. Fill in an IP pool in `addresses`. The IP pool must be an IP range like "192.168.1.100-192.168.1.110" or the CIDR like "192.168.2.0/24".  

    ```yaml
    apiVersion: v1
    kind: ConfigMap
    metadata:
      namespace: iomesh-system
      name: metallb
    data:
      config: |
        address-pools:
        - name: iomesh-access-address-pools
          protocol: layer2
          addresses:
          - <fill-in-your-ip-address-pool-here> # Fill in an IP pool.
    ```

    > **_NOTE_:** `metallb` 0.12.1 does not support binding `address-pools` to a specific NIC. To use the NIC binding feature, `metallb` must be version 0.13.0 or higher. Refer to https://metallb.universe.tf/concepts/layer2/ for configuration.
    
    > **_NOTE_:** If you have updated this ConfigMap, you will need to restart all `metallb` pods in order for the configuration to take effect.

4. Apply the YAML config.
    ```shell
    kubectl apply -f metallb-config.yaml
    ```

5. Check the status of `iomesh-access` service, ensuring an external IP from the IP pool has been assigned to `MetalLB`.
    ```shell
    watch kubectl get service iomesh-access -n iomesh-system
    ```
    ```output
    NAME            TYPE           CLUSTER-IP     EXTERNAL-IP     PORT(S)                                                          AGE
    iomesh-access   LoadBalancer   10.96.22.212   192.168.2.1     3260:32012/TCP,10206:31920/TCP,10201:31402/TCP,10207:31802/TCP   45h
    ```
6. Set `spec.redirector.iscsiVirtualIP` to the external IP by running the following command. Once the changes are saved, the `iomesh-iscsi-redirector` pod will automatically restart to make the modification take effect.
    ```shell
    kubectl edit iomesh iomesh -n iomesh-system
    ```

    > **_NOTE_:** `spec.redirector.iscsiVirtualIP` should be the same as the external IP. If the external IP is changed, update `spec.redirector.iscsiVirtualIP`.

7. An optional step. To use storage from one more IOMesh cluster, run `kubectl edit` command to set the `spec.redirector.iscsiVirtualIP` field in its YAML file to the external IP of the `iomesh-access` service.

<!--END_DOCUSAURUS_CODE_TABS-->

## External Storage vis CSI

After the access point is configured, IOMesh can provide storage externally to a Kubernetes cluster. However, before doing this, it is necessary to install the IOMesh CSI driver in the cluster using the instructions provided below. Note that the installation should be online.

![image](https://user-images.githubusercontent.com/102718816/232662353-dccb8a34-052d-4a3b-9b1a-67f5170c5e4c.png)

> **_NOTE_**: To use this function, the external Kubernetes cluster should be able to access IOMesh `DATA_CIDR` that was configured in [Prerequisites](../deploy-iomesh-cluster/prerequisites#network-requirements).

1. Set up [`open-iscsi`](../deploy-iomesh-cluster/setup-worker-node.md) on the worker nodes of the external Kubernetes cluster.
   
2. Add the Helm chart repository.
    ```shell
    helm repo add iomesh http://iomesh.com/charts
    ```
3. Export the IOMesh CSI Driver configuration file `csi-driver.yaml`.
    ```shell
    helm show values iomesh/csi-driver > csi-driver.yaml
    ```
4. Edit the following fields in `csi-driver.yaml`.
   ```yaml
    nameOverride: "iomesh-csi-driver"
    # ...
    # Specify the container platform, either "kubernetes" or "openshift". 
    co: "kubernetes" 
    coVersion: "1.18"
    # ...
    storageClass:
      nameOverride: "iomesh-csi-driver"
      parameters:
        csi.storage.k8s.io/fstype: "ext4"
        replicaFactor: "2"
        thinProvision: "true"
    # ...
    driver:
      # ...
      # The Kubernetes cluster ID.
      clusterID: "my-cluster"
      # The address of the meta server.
      metaAddr: "iomesh-cluster-vip:10206"
      # The external IP and port number of the chunk server.
      iscsiPortal: "iomesh-cluster-vip:3260"
      # Access IOMesh as external storage.
      deploymentMode: "EXTERNAL"
      # ...
      controller:
        driver:
          podDeletePolicy: "no-delete-pod"
      node:
        driver:
          # ...
          # The root directory of `kubelet` service.
          kubeletRootDir: "/var/lib/kubelet"
      # ...
   ```
    | Field | Value | Description  |
    | ---------|-------|------|
    | `nameOverride` | `"iomesh-csi-driver"` | The CSI driver name.  |
    | `co`       | `"kubernetes"` | The container platform. If your container platform is OpenShift, type `"openshift"`.|
    | `coVersion`| `"1.18"` | The version of the container platform, which should be the same as the version of the cluster hosting IOMesh.  |
    | `storageClass.nameOverride` | `"iomesh-csi-driver"` | The default StorageClass name, which is customizable during installation. |
    | `storageClass.parameters` | `"parameters"` | The parameters for the default StorageClass, which is customizable during installation.
    | `volumeSnapshotClass.nameOverride` | `"iomesh-csi-driver"` |The default volumeSnapshotClass name, which is customizable during installation.|
    | `driver.clusterID` |`"my-cluster"` |The ID of the Kubernetes cluster, which is used to identify the cluster when IOMesh provides storage for multiple Kubernetes clusters. |
    | `driver.metaAddr` | `"iomesh-cluster-vip:10206"` | The external IP of `iomesh-access` service and port number of meta server.  |
    | `driver.iscsiPortal` | `"iomesh-cluster-vip:3260"` | The external IP of `iomesh-access` service and port number of iSCSI Portal.  |
    | `driver.deploymentMode` | `"EXTERNAL"` | `EXTERNAL` means accessing IOMesh as external storage.|
    | `driver.controller.driver.podDeletePolicy` | <p>`"no-delete-pod"`(default)</p><p>`"delete-deployment-pod"`</p><p> `"delete-statefulset-pod"`</p> `"delete-both-statefulset-and-deployment-pod"` | When creating a PVC using the IOMesh CSI driver, it will be bound to a pod. This field allows you to decide whether the pod should be automatically deleted and rebuilt on another healthy worker node if its original worker node has an issue.|
    | `driver.node.driver.kubeletRootDir` | `"/var/lib/kubelet"` |The root directory for `kubelet` service to manage pod-mounted volumes. Default value is `/var/lib/kubelet`. 

5. Deploy IOMesh CSI driver.
    ```shell
    helm install csi-driver iomesh/csi-driver \
        --namespace iomesh-system \
        --create-namespace \
        --values csi-driver.yaml \
        --wait
    ```
6. Verify that IOMesh CSI driver has been successfully installed. If all pods are shown in `Running` state, then IOMesh CSI driver has been successfully installed.
    ```shell
    watch kubectl get --namespace iomesh-system pods
    ```
    ```output
    NAME                                            READY   STATUS    RESTARTS   AGE
    iomesh-csi-driver-controller-plugin-5dbfb48d5c-2sk97   6/6     Running   0          42s
    iomesh-csi-driver-controller-plugin-5dbfb48d5c-cfhwt   6/6     Running   0          42s
    iomesh-csi-driver-controller-plugin-5dbfb48d5c-drl7s   6/6     Running   0          42s
    iomesh-csi-driver-node-plugin-25585                    3/3     Running   0          39s
    iomesh-csi-driver-node-plugin-fscsp                    3/3     Running   0          30s
    iomesh-csi-driver-node-plugin-g4c4v                    3/3     Running   0          39s
    ```
Once IOMesh CSI driver is installed, you may refer to [Volume Operations](../volume-operations/create-storageclass) and [VolumeSnapshot Operations](../volumesnapshot-operations/create-snapshotclass) for storage operations.


## IOMesh as iSCSI Target

IOMesh provides support for the external iSCSI access service. You can create an iSCSI LUN by creating a PVC that can be accessed via any iSCSI client such as `open-iscsi` located beyond the Kubernetes cluster.

> **_NOTE_**: To use this function, the iSCSI client should be able to access IOMesh `DATA_CIDR` that was configured in [Prerequisites](../deploy-iomesh-cluster/prerequisites#network-requirements).

### Create iSCSI LUN using PVC

1. Create a PVC as an external iSCSI LUN. You may obtain the iSCSI client IQNs by using the command `cat /etc/iscsi/initiatorname.iscsi`.
    ```yaml
    apiVersion: v1
    kind: PersistentVolumeClaim
    metadata:
      name: external-iscsi
      annotations:
        # Mark this PVC as an iSCSI LUN for external use.
        iomesh.com/external-use: "true"
        # Set `initiator iqn acl` for iSCSI LUN. If left unspecified, all initiators will be prohibited from accessing this PVC.
        # If `accessModes` is `RWO`, you can only set 1 value in this field.
        # If `accessModes` is `RWX`, you can set multiple values in this field and separate them with the comma (,).
        # To allow all IQNs to access this PVC, set the value to "*/*".
        iomesh.com/iscsi-lun-iqn-allow-list: "iqn.1994-05.com.example:a6c97f775dcb"
    spec:
      storageClassName: iomesh-csi-driver
      accessModes:
        - ReadWriteOnce
      resources:
        requests:
          storage: 1Gi
    ```
    > **_NOTE_**: You can also set the field `iomesh.com/iscsi-lun-iqn-allow-list` after the PVC is created.

2. Once the PVC transitions to the `Bound` state, run the following command to view the field `spec.volumeAttributes.iscsiEntrypoint`.
    ```shell
    kubectl get pv pvc-d84b4657-7ab5-4212-9270-ce40e6a1356a -o jsonpath='{.spec.csi.volumeAttributes.iscsiEndpoint}'
    ```
    ```output
    iscsi://cluster-loadbalancer-ip:3260/iqn.2016-02.com.smartx:system:54e7022b-2dcc-4b43-800c-e52b6fad07d3/1
    # The IP of iSCSI Portal is the cluster LoadBalancer IP, and port number is 3260.
    # The target is `iqn.2016-02.com.smartx:system:54e7022b-2dcc-4b43-800c-e52b6fad07d3`.
    # LUN ID is 1.
    ```
    With the above information, you can use any iSCSI client to access the LUN. For example, if `cluster-loadbalancer-ip` is 192.168.25.101 and the iSCSI client is `open-iscsi`, run the following command:

    ```shell
    iscsiadm -m discovery -t sendtargets  -p 192.168.25.101:3260 --discover
    iscsiadm -m node -T iqn.2016-02.com.smartx:system:54e7022b-2dcc-4b43-800c-e52b6fad07d3 -p 192.168.25.101:3260  --login
    ```

### Delete PVC

To delete a PVC for an iSCSI LUN, ensure that the `iomesh.com/iscsi-lun-iqn-allow-list` field in the PVC is blank or is already deleted. Whether the external iSCSI LUN is retained after deleting the PVC depends on the `reclaimPolicy` field in the StorageClass of the PVC.


